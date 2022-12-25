import { Topic } from 'src/topic/schemas/topic.schema';
import { User } from 'src/user/schemas/user.schema';

export class CreateCommentDto {
  content: string;
  owner: User;
  topicId: string;
}
