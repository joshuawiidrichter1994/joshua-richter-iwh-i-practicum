require('dotenv').config();

const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;
const HUBSPOT_BASE_URL = 'https://api.hubapi.com';
const CUSTOM_OBJECT_TYPE = '2-65554317';
const CUSTOM_OBJECT_PROPERTIES = ['name', 'author', 'genre'];

function getHeaders() {
    if (!PRIVATE_APP_ACCESS) {
        throw new Error('Missing PRIVATE_APP_ACCESS environment variable.');
    }

    return {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };
}

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${HUBSPOT_BASE_URL}/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`, {
            headers: getHeaders(),
            params: {
                properties: CUSTOM_OBJECT_PROPERTIES.join(','),
                limit: 100
            }
        });

        const books = response.data.results.map((record) => ({
            id: record.id,
            name: record.properties.name || '',
            author: record.properties.author || '',
            genre: record.properties.genre || ''
        }));

        res.render('homepage', {
            title: 'Books | Integrating With HubSpot I Practicum',
            books
        });
    } catch (error) {
        console.error('Error retrieving custom object records:', error.response?.data || error.message);
        res.status(500).send('Unable to load the Books table right now.');
    }
});

app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
        errorMessage: '',
        formValues: {
            name: '',
            author: '',
            genre: ''
        }
    });
});

app.post('/update-cobj', async (req, res) => {
    const formValues = {
        name: req.body.name?.trim() || '',
        author: req.body.author?.trim() || '',
        genre: req.body.genre?.trim() || ''
    };

    if (!formValues.name || !formValues.author || !formValues.genre) {
        return res.status(400).render('updates', {
            title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
            errorMessage: 'Please complete all three fields before submitting.',
            formValues
        });
    }

    try {
        await axios.post(`${HUBSPOT_BASE_URL}/crm/v3/objects/${CUSTOM_OBJECT_TYPE}`, {
            properties: formValues
        }, {
            headers: getHeaders()
        });

        res.redirect('/');
    } catch (error) {
        console.error('Error creating custom object record:', error.response?.data || error.message);
        res.status(500).render('updates', {
            title: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
            errorMessage: 'HubSpot could not create the new book record. Please try again.',
            formValues
        });
    }
});

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
