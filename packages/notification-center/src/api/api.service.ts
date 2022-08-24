import { IMessage, HttpClient, ButtonTypeEnum, MessageActionStatusEnum, IParamObject } from '@novu/shared';
import { IStoreQuery, IUserPreferenceSettings } from '../index';

export class ApiService {
  private httpClient: HttpClient;

  isAuthenticated = false;

  constructor(private backendUrl: string) {
    this.httpClient = new HttpClient(backendUrl);
  }

  setAuthorizationToken(token: string) {
    this.httpClient.setAuthorizationToken(token);

    this.isAuthenticated = true;
  }

  disposeAuthorizationToken() {
    this.httpClient.disposeAuthorizationToken();

    this.isAuthenticated = false;
  }

  async updateAction(
    messageId: string,
    executedType: ButtonTypeEnum,
    status: MessageActionStatusEnum,
    payload?: Record<string, unknown>
  ): Promise<any> {
    return await this.defer(async () => {
      return await this.httpClient.post(`/widgets/messages/${messageId}/actions/${executedType}`, {
        executedType,
        status,
        payload,
      });
    });
  }

  async markMessageAsSeen(messageId: string): Promise<any> {
    return await this.defer(async () => {
      return await this.httpClient.post(`/widgets/messages/${messageId}/seen`, {});
    });
  }

  async getNotificationsList(page: number, query: IStoreQuery = {}): Promise<IMessage[]> {
    return await this.defer(async () => {
      return await this.httpClient.get(`/widgets/notifications/feed`, {
        page,
        ...query,
      });
    });
  }

  async initializeSession(appId: string, subscriberId: string, hmacHash = null) {
    return await this.defer(async () => {
      return await this.httpClient.post(`/widgets/session/initialize`, {
        applicationIdentifier: appId,
        subscriberId: subscriberId,
        hmacHash,
      });
    });
  }

  async postUsageLog(name: string, payload: { [key: string]: string | boolean | undefined }) {
    return await this.defer(async () => {
      return await this.httpClient.post('/widgets/usage/log', {
        name: `[Widget] - ${name}`,
        payload,
      });
    });
  }

  async getUnseenCount(query: IStoreQuery = {}) {
    return await this.defer(async () => {
      return await this.httpClient.get('/widgets/notifications/unseen', query as unknown as IParamObject);
    });
  }

  async getOrganization() {
    return await this.defer(async () => {
      return this.httpClient.get('/widgets/organization');
    });
  }

  async getUserPreference(): Promise<IUserPreferenceSettings[]> {
    return await this.defer<IUserPreferenceSettings[]>(async () => {
      return this.httpClient.get('/widgets/preferences');
    });
  }

  async updateSubscriberPreference(
    templateId: string,
    channelType: string,
    enabled: boolean
  ): Promise<IUserPreferenceSettings> {
    return await this.defer<IUserPreferenceSettings>(async () => {
      return await this.httpClient.patch(`/widgets/preferences/${templateId}`, {
        channel: { type: channelType, enabled },
      });
    });
  }

  private defer<T>(callback): Promise<T> {
    let i = 0;

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.isAuthenticated) {
          clearInterval(interval);

          return resolve(callback());
        }
        i++;
        if (i >= 10) {
          return reject();
        }
      }, 10);
    });
  }
}
