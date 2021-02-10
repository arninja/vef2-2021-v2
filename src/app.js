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

// TODO setja upp rest af virkni!
function template(nafn = '', kennitala = '', athugasemd = '', fela = ''){
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
    .isLength({ max: 64}),
  body('kennitala')
    .isLength({ min: 1 })
    .withMessage('Kennitala má ekki vera tóm'),
  body('kennitala')
    .matches(new RegExp(kennitalaPattern))
    .withMessage('Kennitala verður að vera á formi 000000-0000 eða 0000000000'),
  body('athugasemd')
    .isLength({ max: 128 }),

  (req, res, next) => {
    const {
      nafn = '',
      kennitala = '',
      athugasemd = '',
    } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(i => i.msg);
      return res.send(
        `${template(nafn, athugasemd, kennitala)}
        <p>Villur við undirskrift:</p>
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
      kennitala,
      athugasemd,
    } = req.body;

    return res.send(`
      <p>Skráning móttekin!</p>
      <dl>
        <dt>Nafn</dt>
        <dd>${nafn}</dd>
        <dt>Kennitala</dt>
        <dd>${kennitala}</dd>
        <dt>Athugasemd</dt>
        <dd>${athugasemd}</dd>
      </dl>
    `);
  },
);

// Verðum að setja bara *port* svo virki á heroku
app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});
