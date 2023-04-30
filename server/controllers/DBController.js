const config = require('config');
const { logger } = require('../utils/logger');
const { parseOGMetatags } = require('../utils/parseOG');
//helper modules
const scrapper = require('../modules/actorParser');
const ActorRepository = require('../repository/ActorRepository');
const UserHistoryRepository = require('../repository/UserHistoryRepository');
const { clamp } = require('../utils/helpers');

class DBController {
  constructor() {
    this.Actor = new ActorRepository();
    this.History = new UserHistoryRepository();

    this.parseActors = this.parseActors.bind(this);
    this.searchActors = this.searchActors.bind(this);
    this.parseActors = this.parseActors.bind(this);
    this.getPageCount = this.getPageCount.bind(this);
    this.getSingleActor = this.getSingleActor.bind(this);
    this.getSingleActorNew = this.getSingleActorNew.bind(this);
    this.loadHistory = this.loadHistory.bind(this);
  }
  async searchActors(labels) {
    let foundActors = [];
    let shouldParse = [];
    for (let i = 0; i < labels.length; i++) {
      const actor = await this.Actor.findByName(labels[i]);
      if (actor) {
        foundActors.push(actor);
      } else {
        shouldParse.push(labels[i]);
      }
    }
    return { foundActors, shouldParse };
  }

  async parseActors(req, res) {
    try {
      console.log({ labels: [...req.body.labels] });
      // logger.log(req.body.imgUrl);
      let { foundActors, shouldParse } = await this.searchActors(
        req.body.labels
      );
      logger.success('Found in db actors: ', [
        ...foundActors.map((item) => item.name),
      ]);
      logger.pending('Actors to parse: ', [...shouldParse]);
      let that = this;
      if (shouldParse.length > 0) {
        scrapper('https://www.rottentomatoes.com/celebrity/', shouldParse)
          .then(async (response) => {
            if (response === 'error') {
              res.status(404).json({ msg: 'couldn`t find any actordata' });
              return;
            }
            let data = [];
            if (foundActors.length > 0) {
              data = response.concat(foundActors);
            }
            let shouldSave = data.length > 0 ? data : response;
            res
              .status(200)
              .json({ actorData: data.length > 0 ? data : response });
            response.forEach(async (item) => {
              let find = await that.Actor.findByName(item.name);
              if (find) {
                return;
              }
              await that.Actor.createActor({
                name: item.name,
                image: item.image,
                knownFor: item.knownFor,
                birthday: item.birthday,
                birthPlace: item.birthPlace,
                biography: item.biography,
              });
              logger.success(
                item.name,
                'Actor has been successfuly saved to db'
              );
            });

            await that.History.create({
              actors: shouldSave.map((item) => item.name),
              usedImage: req.body.imgUrl.split('/').pop(),
              owner: req.user.userId,
              date: req.body.time,
            });
            logger.success('User history has been saved successfuly');
          })
          .catch((e) => {
            logger.error(e);
            //return res.status(400).json({ msg: e.message });
          });
      } else if (shouldParse.length === 0 && foundActors.length > 0) {
        res.status(200).json({ actorData: foundActors });
        await this.History.create({
          actors: foundActors.map((item) => item.name),
          usedImage: req.body.imgUrl.split('/').pop(),
          owner: req.user.userId,
          date: req.body.time,
        });
        logger.success('User history has been saved successfuly');
      } else {
        res.status(404).json({ msg: 'coudn`t find any actordata' });
      }
    } catch (e) {
      res.status(500).json({ msg: e.message });
      logger.error(e);
    }
  }

  async parseWikiActors(req, res) {
    try {
      const baseUrl = 'https://en.wikipedia.org/wiki/';
      const actorNames = req.body.actorNames;
      let wikiData = [];
      for (let i = 0; i < actorNames.length; i++) {
        let link = baseUrl + actorNames[i];
        let parsed = await parseOGMetatags(link);
        if (parsed.title && parsed.image)
          wikiData.push({
            photo: parsed.image,
            name: parsed.title.split('-')[0],
            link,
          });
      }
      res.status(200).json([...wikiData]);
    } catch (e) {
      res.status(500).json({ msg: e.msg });
      logger.error(e);
    }
  }

  async getPageCount(userId) {
    try {
      return await this.History.count(userId);
    } catch (e) {
      res.status(500).json({ msg: e.msg });
      logger.error(e);
    }
  }

  async getSingleActor(req, res) {
    try {
      let actor = await this.Actor.findByName(req.body.name);
      res.status(200).json(actor);
    } catch (e) {
      res.status(500).json({ msg: e.msg });
      logger.error(e);
    }
  }

  async getSingleActorNew(req, res) {
    try {
      let actor = await this.Actor.findByNameNew(req.body.name);
      res.status(200).json(actor);
    } catch (e) {
      res.status(500).json({ msg: e.msg });
      logger.error(e);
    }
  }

  async loadHistory(req, res) {
    try {
      const { userId } = req.user;
      const { page: pageNumber = 0 } = req.query;
      const offset = 20;
      const totalCount = await this.getPageCount(userId);
      const totalPages = Math.floor(totalCount / offset);
      const currentPage = clamp(pageNumber, 0, totalPages);
      const history = await this.History.loadHistory(
        userId,
        currentPage,
        offset
      );
      res.status(200).json({
        totalCount,
        totalPages,
        currentPage,
        offset,
        data: history,
      });
    } catch (e) {
      res.status(500).json({ message: 'e' });
      logger.error(e);
    }
  }
}
module.exports.DBController = new DBController();