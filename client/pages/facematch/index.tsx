import FoundActors from '@/components/Pages/FaceMatchPage/FoundActors';
import RecognitionPhoto from '@/components/Pages/FaceMatchPage/RecognitionPhoto';
import UploadPhoto from '@/components/Pages/FaceMatchPage/UploadPhoto';
import WikiResults from '@/components/Pages/FaceMatchPage/WikiResults';
import Button from '@/components/UI/Button';
import { useActions } from '@/store/useActions';
import { RecognitionResponse } from '@/types';
import clsx from 'clsx';

import { FC, ReactElement, useEffect, useState } from 'react';

import { ActorsService } from '@/api';
import styles from './facematch.module.scss';
import Test from './test.png';
import WithActorModal from '@/components/Layouts/WithActorModal';
import MainLayout from '@/components/Layouts/MainLayout';
import { recogniseActorsTypeDto } from 'api/dto/recognisedActors.dto';

const FaceMatch = () => {
  const { setMessage } = useActions();
  const [photo, setPhoto] = useState<string | null>(Test.src);
  const [showImageUploader, setShowImageUploader] = useState(true);
  const [recognitionLoading, setRecognitionLoading] = useState(false);
  const [recognitionFailed, setRecognitionFailed] = useState(false);
  const [actorNames, setActorNames] = useState<string[]>([]);

  const UploadPhotoHanlder = async (photo: string) => {
    try {
      setPhoto(photo);
      setRecognitionLoading(true);
      setActorNames([]);
      setRecognitionFailed(false);
      //Allow ImagePicker to close before <UploadPhoto /> unmounts
      setTimeout(() => {
        setShowImageUploader(false);
      });

      const { names, image }: recogniseActorsTypeDto =
        await ActorsService.recogniseActors(photo);
      setRecognitionLoading(false);
      if (names.length === 0) {
        setRecognitionFailed(true);
        setMessage({
          msg: 'Could not find any actor in the photo',
          type: 'error',
        });
        return;
      }
      setPhoto(image);
      setActorNames(names);
    } catch (e) {
      console.log({ e });
      setMessage({ msg: (e as Error).message, type: 'error' });
      setRecognitionLoading(false);
      setShowImageUploader(true);
    }
  };

  if (showImageUploader) {
    return (
      <div className={styles.UploaderWrapper}>
        <UploadPhoto onPhotoUpload={(photo) => UploadPhotoHanlder(photo)} />
      </div>
    );
  }
  if (!showImageUploader && photo) {
    return (
      <div className={styles.Page}>
        <div className={clsx(styles.RecognitionImageWrapper, 'mb-20')}>
          {!recognitionLoading && (
            <div
              className={clsx(styles.BackBtn, 'mb-20')}
              onClick={() => setShowImageUploader(true)}
            >
              <Button text='&#x27F5; Back' />
            </div>
          )}

          <RecognitionPhoto
            displayImage={photo as string}
            loading={recognitionLoading}
          />
          <WikiResults
            names={actorNames}
            recognitionFailed={recognitionFailed}
          />
        </div>
        <FoundActors
          names={actorNames}
          recognitionFailed={recognitionFailed}
          photo={photo}
        />
      </div>
    );
  }
  return <div style={{ marginTop: '60px' }}>Loading...</div>;
};

FaceMatch.getLayout = (page: ReactElement) => {
  return (
    <MainLayout>
      <WithActorModal>{page}</WithActorModal>
    </MainLayout>
  );
};

export default FaceMatch;
