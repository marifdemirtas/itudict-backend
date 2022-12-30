import { CreateCommentDto } from '../../src/comment/dto/create-comment.dto';

export const CommentDtoStub = (): CreateCommentDto => {
  return {
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Aliquet bibendum enim facilisis gravida. Penatibus et magnis dis parturient.',
    topicId: 'some id',
    title: 'this is a title',
  };
};
