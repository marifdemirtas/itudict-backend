import { CreateCommentDto } from '../../src/comment/dto/create-comment.dto';

export const CommentDtoStub = (): CreateCommentDto => {
  return {
    content: 'adfadfsdfadfsadf s fdsf sf',
    topicId: 'dfsdf',
    title: 'this is a title',
  };
};
