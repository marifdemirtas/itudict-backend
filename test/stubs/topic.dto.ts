import { CreateTopicDto } from '../../src/topic/dto/create-topic.dto';

export const TopicDtoStub = (): CreateTopicDto => {
  return {
    title: 'this is a title',
  };
};
