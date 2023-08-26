export type LoggedUser = {
  id: string;
  name: string;
  email: string;
  permissions: string[];
  tokenExpiration: Date;
};
