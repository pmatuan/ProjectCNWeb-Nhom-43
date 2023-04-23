const { Quizes, Questions } = require('../models/quizes');

const getQuizes = async (req, res, next) => {
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
};

const createQuiz = async (req, res, next) => {
  try {
    const { name, questionIds } = req.body;

    const questions = await Questions.find({
      _id: { $in: questionIds },
    }).populate('answers');

    const quiz = new Quizes({
      name: name,
      questions: questions,
    });

    await quiz.save();

    res.status(201).json({ message: 'Quiz created successfully!', quiz: quiz });
  } catch (error) {
    next(error);
  }
};

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

const getQuizById = (req, res, next) => {
  Quizes.findById(req.params.quizId)
    .then((quiz) => {
      const { name, questions } = quiz;
      const html = formatQuizHtml(
        name,
        questions,
      );
      res.status(200).send(html);
    })
    .catch((err) => next(err));
};

const formatQuizHtml = (name, questions) => {
  let html = `<p style="text-align:center"><b>${name}</b></p>`;
  let num = 1;
  for (const question of questions) {
    if (!question.isEnabled) continue;
    const { question: questionText, answers, answer, explanation } = question;
    html += `${num}. ${questionText}<br><div style="margin:10px">`;
    for (const answer of answers) {
      html += `${answer.option}<br>`;
    }
    html += `</div><b>Answer:</b> ${answer}<br><b>Explanation:</b> ${explanation}<br><hr>`;
    num++;
  }
  return html;
};

const updateQuizById = (req, res, next) => {
  Quizes.findByIdAndUpdate(req.params.quizId, { $set: req.body }, { new: true })
    .then((quiz) => {
      res.status(200).json(quiz);
    })
    .catch((err) => next(err));
};

const deleteQuizById = (req, res, next) => {
  Quizes.findByIdAndRemove(req.params.quizId)
    .then((quiz) => {
      res.status(200).json(quiz);
    })
    .catch((err) => next(err));
};

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

const getQuizQuestions = (req, res, next) => {
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
};

const addQuizQuestion = (req, res, next) => {
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
};

const deleteQuizQuestions = (req, res, next) => {
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
};

const notSupported = (req, res) => {
  res
    .status(403)
    .send(
      `PUT operation not supported on /quizes/${req.params.quizId}/questions`,
    );
};

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

const getQuizQuestion = (req, res, next) => {
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
};

const postQuizQuestion = (req, res, next) => {
  res.statusCode = 403;
  res.end(
    `POST operation not supported on /quizes/${req.params.quizId}/questions${req.params.questionId}`,
  );
};

const putQuizQuestion = (req, res, next) => {
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
};

const deleteQuizQuestion = (req, res, next) => {
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
};

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

module.exports = {
  getQuizes,
  createQuiz,
  getQuizById,
  updateQuizById,
  deleteQuizById,
  getQuizQuestions,
  addQuizQuestion,
  deleteQuizQuestions,
  notSupported,
  getQuizQuestion,
  postQuizQuestion,
  putQuizQuestion,
  deleteQuizQuestion,
};
