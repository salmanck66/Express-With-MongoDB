const express = require('express');
const fs = require('fs')
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(methodOverride('_method'));//Since you are using the app.put method for updates, and app.delete for deletions, you need to use a middleware called method-override to override the HTTP method
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');
// app.set('views', 'views');



app.get('/', (req, res) => {
    const jsonData = fs.readFileSync('data.json', 'utf-8');
    const donors = JSON.parse(jsonData);
    res.render('index', { donors: donors, index: -1 });

  });



app.get('/adduser', (req, res) => {
    res.render('form');
  });


app.post('/post', (req, res) => {
    const userData =
    {
        name : req.body.name,
        age : req.body.age,
        phonenumber : req.body.phonenumber,
        bloodgroup : req.body.bloodgroup
    }
    // Read existing data from data.json
    const existingData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
    existingData.push(userData);
    fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2));
    res.redirect('/');
  });

  app.get('/edit/:index', (req, res) => {
    const index = req.params.index;
    const jsonData = fs.readFileSync('data.json', 'utf-8');
    const donors = JSON.parse(jsonData);

    if (index >= 0 && index < donors.length) {
        const user = donors[index];
        res.render('editform', { user: user, index: index });
    } else {
        res.status(404).send('Donor not found.');
    }
});

app.put('/update', (req, res) => {
  console.log("Hellooo");
  const updatedData = req.body;
  const index = parseInt(updatedData.index);
  const jsonData = fs.readFileSync('data.json', 'utf-8');
  const existingData = JSON.parse(jsonData);

  if (index >= 0 && index < existingData.length) {
      existingData[index] = updatedData;
      fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2));
      res.sendStatus(204);
  } else {
      res.status(404).send('Donor not found.');
  }
});

  app.delete('/delete/:index', (req, res) => {
    const index = parseInt(req.params.index);
    const jsonData = fs.readFileSync('data.json', 'utf-8');
    const existingData = JSON.parse(jsonData);

    if (index >= 0 && index < existingData.length) {
        // Remove the donor at the specified index
        existingData.splice(index, 1);
        fs.writeFileSync('data.json', JSON.stringify(existingData, null, 2));
        res.sendStatus(204); // Send a success status without any content
    } else {
        res.status(404).send('Donor not found.');
    }
});

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });