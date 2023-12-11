const express = require('express');
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/crud')
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(methodOverride('_method'));//Since you are using the app.put method for updates, and app.delete for deletions, you need to use a middleware called method-override to override the HTTP method
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const Dschema = new mongoose.Schema({
  name : String,
  age : Number,
  phonenumber: Number,
  bloodgroup: String
},{ versionKey: false })

const dmodel = mongoose.model('donors',Dschema)

app.set('view engine', 'ejs');

app.get('/',async (req,res)=>
{
  try
  {
    const donors = await dmodel.find({})
    res.render('index',{donors : donors})
  }
  catch(error)
  {
    console.log(error);
  }
})

app.get('/adduser', (req, res) => {
    res.render('form');
  });

app.post('/post',async (req,res)=>
{
  try{
    const newUser = new dmodel({
      name : req.body.name,
      age : req.body.age,
      phonenumber : req.body.phonenumber,
      bloodgroup : req.body.bloodgroup
    })
    await newUser.save()
    res.redirect('/')
  }catch(error)
  {
    console.error('Error saving user data to MongoDB:', error);
    res.status(500).send('Internal Server Error');
  }
})

app.get('/edit/:id', async (req, res) => {
  const donorId = req.params.id;
  try {
    const donor = await dmodel.findById(donorId);
    if (donor) {
      res.render('editform', { donor: donor });
    } else {
      console.log('Donor not found');
      res.status(404).json({ error: 'Donor not found' });
    }
  } catch (error) {
    console.error('Error fetching donor for edit:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/update/:id',async (req, res) => {
  const donorId = req.params.id;
  const { name, age, phonenumber, bloodgroup } = req.body;

  try
  {
    const result = await dmodel.findByIdAndUpdate(donorId, { name, age, phonenumber, bloodgroup })
    if(result)
    {
      console.log('Donor updated successfully');
      res.redirect('/');
    }else
    {
      console.log('Donor not found');
      res.status(404).json({ error: 'Donor not found' });
    }

  }
  catch(error)
  {
    console.error('Error updating donor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.delete('/delete/:id', async (req, res) => {
  const donorId = req.params.id;
  try
  {
    const result = await dmodel.findByIdAndDelete(donorId)
    if (result) {
      console.log('Donor deleted successfully');
      res.status(204).end(); // No content response for successful deletion
    } else {
      console.log('Donor not found');
      res.status(404).json({ error: 'Donor not found' });
    }
  }
  catch(error)
  {
    console.error('Error deleting donor:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });