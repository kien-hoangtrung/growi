import { FC, memo, useEffect } from 'react';
import loggerFactory from '@alias/logger';
import { useCurrentPageCommentsSWR } from '~/stores/page';
import { Comment } from '~/interfaces/page';

import { apiv3Put } from '~/utils/apiv3-client';

const logger = loggerFactory('growi:components:PageComment:PageComments');

// import AppContainer from '../services/AppContainer';
// import CommentContainer from '../services/CommentContainer';
// import PageContainer from '../services/PageContainer';

// import CommentEditor from './PageComment/CommentEditor';
// import Comment from './PageComment/Comment';
// import DeleteCommentModal from './PageComment/DeleteCommentModal';
// import ReplayComments from './PageComment/ReplayComments';

type Props = {
  comment: Comment;
  replies: Comment[];
}

const CommentThread:FC<Props> = memo(({ comment, replies }:Props) => {
  const commentId = comment._id;
  // const showEditor = this.state.showEditorIds.has(commentId);
  // const isLoggedIn = this.props.appContainer.currentUser != null;
  const rootClassNames = ['page-comment-thread'];
  if (replies.length === 0) {
    rootClassNames.push('page-comment-thread-no-replies');
  }

  return (
    <div key={commentId} className={rootClassNames.join(' ')}>
      {comment.comment}
      {/* TODO GW-5146 display comment */}
      {/* <Comment
        comment={comment}
        deleteBtnClicked={this.confirmToDeleteComment}
        growiRenderer={this.growiRenderer}
      />
      {replies.length !== 0 && (
        <ReplayComments
          replyList={replies}
          deleteBtnClicked={this.confirmToDeleteComment}
          growiRenderer={this.growiRenderer}
        />
      )} */}
      {/* TODO GW-5147 display comment editor */}
      {/*
      { !showEditor && isLoggedIn && (
        <div className="text-right">
          <Button
            outline
            color="secondary"
            size="sm"
            className="btn-comment-reply"
            onClick={() => { return this.replyButtonClickedHandler(commentId) }}
          >
            <i className="icon-fw icon-action-undo"></i> Reply
          </Button>
        </div>
      )}
      { showEditor && (
        <div className="page-comment-reply-form ml-4 ml-sm-5 mr-3">
          <CommentEditor
            growiRenderer={this.growiRenderer}
            replyTo={commentId}
            onCancelButtonClicked={this.editorCancelHandler}
            onCommentButtonClicked={this.editorCommentHandler}
          />
        </div>
      )} */}
    </div>
  );
});


export const PageComments:FC = () => {
  const { data: comments } = useCurrentPageCommentsSWR();

  useEffect(() => {
    if (comments == null) {
      return;
    }
    const noImageCacheUserIds = comments.filter((comment) => {
      const { creator } = comment;
      return creator != null && creator.imageUrlCached == null;
    }).map((comment) => {
      return comment.creator._id;
    });

    if (noImageCacheUserIds.length === 0) {
      return;
    }

    try {
      apiv3Put('/users/update.imageUrlCache', { userIds: noImageCacheUserIds });
    }
    catch (err) {
      // Error alert doesn't apear, because user don't need to notice this error.
      logger.error(err);
    }
  }, [comments]);

  if (comments == null) {
    return null;
  }

  const topLevelComments = [] as Comment[];
  const replyComments = [] as Comment[];

  comments.forEach((comment) => {
    if (comment.replyTo == null) {
      // comment is not a reply
      topLevelComments.push(comment);
    }
    else {
      // comment is a reply
      replyComments.push(comment);
    }
  });

  return (
    <>
      { topLevelComments.map((topLevelComment) => {
        // get related replies
        const replies = replyComments.filter(reply => reply.replyTo === topLevelComment._id);

        return <CommentThread comment={topLevelComment} replies={replies} />;
      }) }

      {/* TODO GW-5148 implement dlete comment */}
      {/* <DeleteCommentModal
        isShown={this.state.isDeleteConfirmModalShown}
        comment={this.state.commentToDelete}
        errorMessage={this.state.errorMessageForDeleting}
        cancel={this.closeDeleteConfirmModal}
        confirmedToDelete={this.deleteComment}
      /> */}
    </>
  );
};

// class DeprecatePageComments extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//       // for deleting comment
//       commentToDelete: undefined,
//       isDeleteConfirmModalShown: false,
//       errorMessageForDeleting: undefined,

//       showEditorIds: new Set(),
//     };

//     this.growiRenderer = this.props.appContainer.getRenderer('comment');

//   }

//   confirmToDeleteComment(comment) {
//     this.setState({ commentToDelete: comment });
//     this.showDeleteConfirmModal();
//   }

//   deleteComment() {
//     const comment = this.state.commentToDelete;

//     this.props.commentContainer.deleteComment(comment)
//       .then(() => {
//         this.closeDeleteConfirmModal();
//       })
//       .catch((err) => {
//         this.setState({ errorMessageForDeleting: err.message });
//       });
//   }

//   showDeleteConfirmModal() {
//     this.setState({ isDeleteConfirmModalShown: true });
//   }

//   closeDeleteConfirmModal() {
//     this.setState({
//       commentToDelete: undefined,
//       isDeleteConfirmModalShown: false,
//       errorMessageForDeleting: undefined,
//     });
//   }

//   replyButtonClickedHandler(commentId) {
//     const ids = this.state.showEditorIds.add(commentId);
//     this.setState({ showEditorIds: ids });
//   }

//   editorCancelHandler(commentId) {
//     this.resetEditor(commentId);
//   }

//   editorCommentHandler(commentId) {
//     this.resetEditor(commentId);
//   }

//   resetEditor(commentId) {
//     this.setState((prevState) => {
//       prevState.showEditorIds.delete(commentId);
//       return {
//         showEditorIds: prevState.showEditorIds,
//       };
//     });
//   }

// }