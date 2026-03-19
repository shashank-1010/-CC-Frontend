import { Request, Response } from 'express';
import Poll from '../models/Poll';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get all polls
// @route   GET /api/polls
export const getPolls = async (req: Request, res: Response): Promise<void> => {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Create a poll
// @route   POST /api/polls
export const createPoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, options } = req.body;
    
    const pollOptions = options.map((text: string) => ({
      text,
      votes: 0,
      voters: []
    }));

    const poll = await Poll.create({
      question,
      options: pollOptions,
      createdBy: req.userId,
      votedUsers: []
    });

    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Vote on a poll
// @route   POST /api/polls/:id/vote
export const votePoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { optionId } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    // Check if user already voted
    if (poll.votedUsers.includes(req.userId)) {
      res.status(400).json({ message: 'You have already voted in this poll' });
      return;
    }

    // Find the option
    const option = poll.options.id(optionId);
    if (!option) {
      res.status(404).json({ message: 'Option not found' });
      return;
    }

    // Add vote
    option.votes += 1;
    poll.votedUsers.push(req.userId);
    await poll.save();

    res.json({ message: 'Vote recorded', poll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Add comment to poll
// @route   POST /api/polls/:id/comment
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { comment } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    poll.comments.push({
      comment,
      userId: req.userId,
      createdAt: new Date()
    });

    await poll.save();
    res.json({ message: 'Comment added', poll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete a poll (admin only)
// @route   DELETE /api/polls/:id
export const deletePoll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    await poll.deleteOne();
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete all comments from a poll (admin only)
// @route   DELETE /api/polls/:id/comments
export const deleteAllComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    poll.comments = [];
    await poll.save();
    res.json({ message: 'All comments deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete a specific comment (admin only)
// @route   DELETE /api/polls/:id/comments/:commentId
export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) {
      res.status(404).json({ message: 'Poll not found' });
      return;
    }

    poll.comments = poll.comments.filter(
      c => c._id?.toString() !== req.params.commentId
    );
    await poll.save();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// @desc    Delete all polls (admin only)
// @route   DELETE /api/polls/all
export const deleteAllPolls = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Poll.deleteMany({});
    res.json({ message: 'All polls deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};