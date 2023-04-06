const router = require('express').Router();

const Quizes = require('../models/quizes');

// get all enabled quizes
async function getQuizes(req, res, next) {
  try {
    const quizes = await Quizes.find({ isEnabled: true }).lean();
    const text = quizes
      .map((quiz) => {
        return `<b>Name: </b>${quiz.name}<br><b>id:</b> ${quiz._id}<br><hr>`;
      })
      .join('');
    res.status(200).send(text);
  } catch (err) {
    next(err);
  }
}

// create a new quiz
async function createQuiz(req, res, next) {
  try {
    const quiz = await Quizes.create(req.body);
    console.log('Quiz Created: ', quiz);
    res.status(200).json(quiz);
  } catch (err) {
    next(err);
  }
}

// delete all quizes
async function deleteQuizes(req, res, next) {
  try {
    const resp = await Quizes.remove({});
    res.status(200).json(resp);
  } catch (err) {
    next(err);
  }
}

// handle unsupported methods
function unsupportedMethods(req, res, next) {
  res.status(403).send('Not supported');
}

router
    .route('/quizes')
    .get(getQuizes)
    .post(createQuiz)
    .delete(deleteQuizes)
    .all(unsupportedMethods);

















router
  .route('/Quizes/:quizId')
  .get(getQuizById)
  .put(updateQuizById)
  .delete(deleteQuizById);

function getQuizById(req, res, next) {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      const { name, instructions, duration, questions } = quiz;
      const durationString = formatDuration(duration);
      const html = formatQuizHtml(
        name,
        instructions,
        durationString,
        questions,
      );
      res.status(200).send(html);
    })
    .catch((err) => next(err));
}

function formatDuration(duration) {
  const { hours, minutes, seconds } = duration;
  return `${hours}:${minutes}:${seconds}`;
}

function formatQuizHtml(name, instructions, durationString, questions) {
  let html = `<p style="text-align:center"><b>${name}</b></p><b>Instructions:</b> ${instructions}<br><b>Duration:</b> ${durationString}<hr>`;
  let num = 1;
  for (const question of questions) {
    if (!question.isEnabled) continue;
    const {
      question: questionText,
      _id,
      answers,
      answer,
      explanation,
    } = question;
    html += `${num}. ${questionText} - ${_id}<br><div style="margin:10px">`;
    for (const answer of answers) {
      html += `${answer.option}<br>`;
    }
    html += `</div><b>Answer:</b> ${answer}<br><b>Explanation:</b> ${explanation}<br><hr>`;
    num++;
  }
  return html;
}

function updateQuizById(req, res, next) {
  Quizes.findByIdAndUpdate(req.params.quizId, { $set: req.body }, { new: true })
    .then((quiz) => {
      res.status(200).json(quiz);
    })
    .catch((err) => next(err));
}

function deleteQuizById(req, res, next) {
  Quizes.findByIdAndRemove(req.params.quizId)
    .then((quiz) => {
      res.status(200).json(quiz);
    })
    .catch((err) => next(err));
}

















function getQuizQuestions(req, res, next) {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz) {
        res.status(200).json(quiz.questions);
      } else {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.status = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
}

function addQuizQuestion(req, res, next) {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz) {
        quiz.questions.push(req.body);
        return quiz.save();
      }
      const err = new Error(`Quiz ${req.params.quizId} not found`);
      err.status = 404;
      throw err;
    })
    .then((quiz) => Quizes.findById(quiz._id))
    .then((quiz) => res.status(200).json(quiz))
    .catch((err) => next(err));
}

function deleteQuizQuestions(req, res, next) {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz) {
        for (let i = quiz.questions.length - 1; i >= 0; i--) {
          quiz.questions.id(quiz.questions[i]._id).remove();
        }
        return quiz.save();
      }
      const err = new Error(`Quiz ${req.params.quizId} not found`);
      err.status = 404;
      throw err;
    })
    .then((quiz) => res.status(200).json(quiz.questions))
    .catch((err) => next(err));
}

function notSupported(req, res) {
  res
    .status(403)
    .send(
      `PUT operation not supported on /quizes/${req.params.quizId}/questions`,
    );
}

router
  .route('/quizes/:quizId/questions')
  .get(getQuizQuestions)
  .post(addQuizQuestion)
  .put(notSupported)
  .delete(deleteQuizQuestions);











function getQuizQuestion(req, res, next) {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(quiz.questions.id(req.params.questionId));
      } else if (quiz == null) {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.statusCode = 404;
        return next(err);
      } else {
        const err = new Error(`Question ${req.params.questionId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
}

function postQuizQuestion(req, res, next) {
  res.statusCode = 403;
  res.end(
    `POST operation not supported on /quizes/${req.params.quizId}/questions${req.params.questionId}`,
  );
}

function putQuizQuestion(req, res, next) {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
        if (req.body.question) {
          quiz.questions.id(req.params.questionId).question = req.body.question;
        }
        if (req.body.answers) {
          quiz.questions.id(req.params.questionId).answers = req.body.answers;
        }
        if (req.body.answer) {
          quiz.questions.id(req.params.questionId).answer = req.body.answer;
        }
        if (req.body.isEnabled != null) {
          quiz.questions.id(req.params.questionId).isEnabled =
            req.body.isEnabled;
        }
        quiz.save().then(
          (quiz) => {
            Quizes.findById(quiz._id).then((quiz) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(quiz.questions.id(req.params.questionId));
            });
          },
          (err) => next(err),
        );
      } else if (quiz == null) {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.statusCode = 404;
        return next(err);
      } else {
        const err = new Error(`Question ${req.params.questionId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
}

function deleteQuizQuestion(req, res, next) {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
        quiz.questions.id(req.params.questionId).remove();
        quiz.save().then(
          (quiz) => {
            Quizes.findById(quiz._id).then((quiz) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(quiz);
            });
          },
          (err) => next(err),
        );
      } else if (quiz == null) {
        const err = new Error(`Quiz ${req.params.quizId} not found`);
        err.statusCode = 404;
        return next(err);
      } else {
        const err = new Error(`Question ${req.params.questionId} not found`);
        err.statusCode = 404;
        return next(err);
      }
    })
    .catch((err) => next(err));
}

router
  .route('/quizes/:quizId/questions/:questionId')
  .get(getQuizQuestion)
  .post(postQuizQuestion)
  .put(putQuizQuestion)
  .delete(deleteQuizQuestion);

module.exports = router;
