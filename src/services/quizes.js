const { Quizes, Questions } = require('../models/quizes');

const getQuizes = async (req, res) => {
  try {
    const quizes = await Quizes.find({ isEnabled: true }).lean();
    const text = quizes
      .map((quiz) => {
        return `<b>Name: </b>${quiz.name}<br><b>id:</b> ${quiz._id}<br><hr>`;
      })
      .join('');
    res.status(200).send(text);
  } catch (err) {
    console.log(err);
  }
};

const createQuiz = async (req, res) => {
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
  } catch (err) {
    console.log(err);
  }
};

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const { name, questions } = quiz;
    const html = formatQuizHtml(name, questions);
    res.status(200).send(html);
  } catch (err) {
    console.log(err);
  }
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

const updateQuizById = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.name = req.body.name;
    quiz.questions = await Questions.find({
      _id: { $in: req.body.questionIds },
    }).populate('answers');

    await quiz.save();

    res.status(200).json(quiz);
  } catch (err) {
    console.log(err);
  }
};

const deleteQuizById = async (req, res) => {
  try {
    const quiz = await Quizes.findByIdAndRemove(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (err) {
    console.log(err);
  }
};

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

const getQuizQuestions = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ message: `Quiz ${req.params.quizId} not found` });
    }
    res.status(200).json(...quiz.questions);
  } catch (err) {
    return console.log(err);
  }
};

const addQuizQuestion = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ message: `Quiz ${req.params.quizId} not found` });
    }
    quiz.questions.push(req.body);
    const savedQuiz = await quiz.save();
    const updatedQuiz = await Quizes.findById(savedQuiz._id);
    res.status(200).json(updatedQuiz);
  } catch (err) {
    console.log(err);
  }
};

const deleteQuizQuestions = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);
    if (!quiz) {
      return res
        .status(404)
        .json({ message: `Quiz ${req.params.quizId} not found` });
    }
    for (let i = quiz.questions.length - 1; i >= 0; i--) {
      quiz.questions.id(quiz.questions[i]._id).remove();
    }
    const savedQuiz = await quiz.save();
    res.status(200).json(savedQuiz.questions);
  } catch (err) {
    console.log(err);
  }
};

/*___________________________________________________*/
/*___________________________________________________*/
/*___________________________________________________*/

const getQuizQuestion = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);
    if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(quiz.questions.id(req.params.questionId));
    } else if (quiz == null) {
      return res
        .status(404)
        .json({ message: `Quiz ${req.params.quizId} not found` });
    } else {
      return res
        .status(404)
        .json({ message: `Question ${req.params.questionId} not found` });
    }
  } catch (err) {
    console.log(err);
  }
};

const putQuizQuestion = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);
    if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
      if (req.body.question) {
        quiz.questions.id(req.params.questionId).question = req.body.question;
      }
      if (req.body.explanation) {
        quiz.questions.id(req.params.questionId).explanation = req.body.explanation;
      }
      if (req.body.answers) {
        quiz.questions.id(req.params.questionId).answers = req.body.answers;
      }
      if (req.body.answer) {
        quiz.questions.id(req.params.questionId).answer = req.body.answer;
      }
      if (req.body.isEnabled != null) {
        quiz.questions.id(req.params.questionId).isEnabled = req.body.isEnabled;
      }
      await quiz.save();
      const updatedQuiz = await Quizes.findById(quiz._id);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedQuiz.questions.id(req.params.questionId));
    } else if (quiz == null) {
      return res
        .status(404)
        .json({ message: `Quiz ${req.params.quizId} not found` });
    } else {
      return res
        .status(404)
        .json({ message: `Question ${req.params.questionId} not found` });
    }
  } catch (err) {
    console.log(err);
  }
};

const deleteQuizQuestion = async (req, res) => {
  try {
    const quiz = await Quizes.findById(req.params.quizId);
    if (quiz != null && quiz.questions.id(req.params.questionId) != null) {
      quiz.questions.id(req.params.questionId).remove();
      await quiz.save();
      const updatedQuiz = await Quizes.findById(quiz._id);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(updatedQuiz);
    } else if (quiz == null) {
      return res
        .status(404)
        .json({ message: `Quiz ${req.params.quizId} not found` });
    } else {
      return res
        .status(404)
        .json({ message: `Question ${req.params.questionId} not found` });
    }
  } catch (err) {
    console.log(err);
  }
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
  getQuizQuestion,
  putQuizQuestion,
  deleteQuizQuestion,
};
