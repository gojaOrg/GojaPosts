const mongoose = require('mongoose');
const dbHandler = require('./db-handler');

const postModel = require('../models/postModel');
const postData = {
    audio: 'audioURL',
    text: 'testeroo',
    user: {
        profileAudio: 'audioURL',
        userName: 'ImATester',
        email: 'test@tester.se' 
    },
    likes: 13

};

/**
 * Connect to a new in-memory database before running any tests.
 */
 beforeAll(async () => await dbHandler.connect());

 /**
  * Clear all test data after every test.
  */
  afterEach(async () => await dbHandler.clearDatabase());

  /**
  * Remove and close the db and server.
  */

 afterAll(async () => await dbHandler.closeDatabase());

/**
 * Post test suite.
 */
 describe('Post Model Test ', () => {

    it('create & save post successfully', async () => {

      const savedPost = await postModel.create(postData);
      expect(savedPost._id).toBeDefined();
      expect(savedPost.audio).toBe(postData.audio);
      expect(savedPost.user.userName).toBe(postData.user.userName);
      expect(savedPost.likes).toBe(postData.likes);
    });

    it('delete post successfully', async () => {

      const savedPost = await postModel.create(postData);
      expect(savedPost._id).toBeDefined();
      var res = await postModel.exists({_id: savedPost._id});
      expect(res).toBeTruthy();

      await postModel.deleteOne({_id: savedPost._id});
      res = await postModel.exists({_id: savedPost._id});
      expect(res).toBeFalsy();

    });

    it('create post without required field should failed', async () => {
      const postWithoutRequiredField = new postModel({ text: 'test' });
      let err;
      try {
          const savedPostWithoutRequiredField = await postWithoutRequiredField.save();
          error = savedPostWithoutRequiredField;
      } catch (error) {
          err = error
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.errors.audio).toBeDefined();
    });
});