const Subscription = {
  comment: {
    async subscribe(_, args, { prisma, pubsub }, _1) {
      const postExists = await prisma.post.findFirst({
        where: {
          id: args.postId,
          published: true,
        },
      });

      if (!postExists) {
        throw new Error("Post not found");
      }

      return pubsub.asyncIterator(`comment ${args.postId}`);
    },
  },
  post: {
    subscribe(_, _1, { pubsub }, _2) {
      return pubsub.asyncIterator("post");
    },
  },
};

export default Subscription;
