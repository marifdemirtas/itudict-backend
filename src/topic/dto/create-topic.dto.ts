import { User } from '../../user/schemas/user.schema';

export class CreateTopicDto {
  title: string;
  content: string;
  owner: User;
}
