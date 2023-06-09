import { LoadHistoryResponse } from '@/types';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { UserHistoryResponseDto } from './dto/userHistory.dto';
import { Api } from './index';

export const UserService = {
  async loadHistory(pageNumber: number = 0) {
    const data: UserHistoryResponseDto = await Api.get(
      `/users/user_history?page_number=${pageNumber}`
    );
    return data;
  },
  async loadHistorySSR(pageNumber: number = 0, cookies: string) {
    const response = await fetch(
      `${process.env.SERVER}/users/user_history?page_number=${pageNumber}`,
      {
        credentials: 'include',
        headers: {
          Cookie: cookies,
        },
      }
    );
    const data: UserHistoryResponseDto = await response.json();
    return data;
  },
};
