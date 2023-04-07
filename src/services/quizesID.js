const Quizes = require('../models/quizes');

const getQuizById = (req, res, next) => {
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
};

const formatDuration = (duration) => {
  const { hours, minutes, seconds } = duration;
  return `${hours}:${minutes}:${seconds}`;
};

const formatQuizHtml = (name, instructions, durationString, questions) => {
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

module.exports = { getQuizById, updateQuizById, deleteQuizById };