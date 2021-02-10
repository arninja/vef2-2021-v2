import express from 'express';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

const {
  PORT: port = 3001,
} = process.env;

const app = express();

app.use(express.urlencoded({ extended: true }));

const kennitalaPattern = '^[0-9]{6}-?[0-9]{4}$'
const todayDate = new Date().toISOString().slice(0,10);

// TODO setja upp rest af virkni!
function template(nafn = '', kennitala = '', athugasemd = '', fela = true){
  return`
  <h1>Undirskriftarlisti</h1>
  <form method="post" action="/post" enctype="application/x-www-form-urlencoded">
    <label for="nafn"> 
      Nafn
      <input
        type="text"
        name="nafn"
        size="96"
        value="${nafn}"
      >
    </label>
    </br>
    <label for="kennitala"> 
      Kennitala 
      <input 
        type="text" 
        name="kennitala"
        size="96"
        value="${kennitala}"
      >
    </label>
    </br>
    <label for="athugasemd">
      Athugasemd:
      <textarea
        type="text"
        name="athugasemd"
        rows="2"
        cols="86"
        value="${athugasemd}"
      >
      </textarea>
    </label>
    </br>
    <input
      type="checkbox"
      name="fela"
      value="${fela}"
      id="fela"
    >
    <label for="fela">
      Ekki birta nafn á lista
    </label>
    </br>
    <button>Skrifa undir</button>
    </form>
  `;
}

app.get('/', (req, res) => {
  res.send(template());
});
app.post(
  '/post',

  // Þetta er bara validation, ekki sanitization
  body('nafn')
    .isLength({ min: 1})
    .withMessage('Nafn má ekki vera tómt'),
  body('nafn')
    .isLength({ max: 128})
    .withMessage('Nafn má að hámarki vera 128 stafir'),
  body('kennitala')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('kennitala')
    .matches(new RegExp(kennitalaPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('athugasemd')
    .isLength({ max: 400 })
    .withMessage('Athugasemd má að hámarki vera 400 stafir'),

  (req, res, next) => {
    const {
      nafn = '',
      kennitala = '',
      athugasemd = '',
      fela = false,
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      return res.send(
        `${template(nafn, athugasemd, kennitala, fela)}
        <p><strong>Villur við undirskrift:</strong></p>
        <ul>
          <li>${errorMessages.join('</li><li>')}</li>
        </ul>
      `);
    }

    return next();
  },
  // Nú sanitizeum við gögnin
  body('nafn').trim().escape(),
  body('kennitala').blacklist('-'),
  body('athugasemd').trim().escape(),

  (req, res) => {

    const {
      nafn,
      athugasemd,
      fela,
    } = req.body;

    return res.send(`
      ${template(nafn, athugasemd, fela)}
      <table>
        <tr>
          <th>Dagsetning</th>
          <th>Nafn</th>
          <th>Athugasemd</th>
        </tr>
        <tr>
          <td>${todayDate}</td>
          <td>${nafn}</td>
          <td>${athugasemd}</td>
        </tr>
      <table>
      
    `);
  },
);

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
