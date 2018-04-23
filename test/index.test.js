const { MongoClient, ObjectID } = require('mongodb');
const { promisify } = require("es6-promisify");
//const Server = promisify(require('./server'))
const Path = require('path')
const nconf = require('nconf'); //manage configuration in json file, see details at https://github.com/indexzero/nconf
nconf.argv().env().file({ file: Path.resolve(__dirname, '../application-configuration.json') });

let connection;
let db;
let server;

beforeAll(() => {
    console.log(`Before ALL ${global.__MONGO_URI__}:${global.__MONGO_DB_NAME__}`)
    expect.assertions(2)
    global.__MONGO_ObjectID__ = ObjectID;
    return MongoClient.connect(global.__MONGO_URI__)
        .then(conn => {
            connection = conn;
            return global.__MONGO_DB__ = db = conn.db(global.__MONGO_DB_NAME__)
        })
        .catch(error => console.log(error))
});

afterAll(() => {
    return connection.close()
        .then(() => db.close())
        .catch(error => console.log(error))
});

describe('Testing create/read operation of data access layer', () => {
    it('should insert a doc into collection', (done) => {
        const resourceRequestDAL = require('../src/dal/resource-request-dal')(db, ObjectID)
        const rr =
            {
                accountName: 'account-name',
                resourceType: 'resource-type',
                resourceRate: '1000',
                quantity: '1',
                status: 'open',
                owner: { id: '11111111111', email: 'tuan.phananh@harveynash.com.au', name: 'Tuan Anh Phan' }
            };
        //create a resource request in mongodb
        resourceRequestDAL.createRequest(rr, (error, request_id) => {
            if (error) {
                console.log('error in resource request creation ', error)
                return done(error);
            }
            //retrieve just-created record
            resourceRequestDAL.getRequestByID(request_id, (error, request) => {
                if (error) {
                    console.log('error in get resource request by id ', error)
                    return done(error);
                }

                delete rr.updatedDate;
                delete rr.owner
                delete request.submissionDate
                delete request._id
                expect(request).toEqual(rr);
                
                //retrieve all records in mongodb
                resourceRequestDAL.getRequests((error, requests) => {
                    if (error) {
                        console.log('error in get resource request by id ', error)
                        return done(error);
                    }
                    expect(requests.length).toEqual(1)
                    done()
                });
            })

        });
    });
})

describe('testing the viewer layer', () => {
    var Handlebars = require("handlebars")
    var source = "<p>Hello, my name is {{name}}. I am from {{hometown}}. I have " +
        "{{kids.length}} kids:</p>" +
        "<ul>{{#kids}}<li>{{name}} is {{age}}</li>{{/kids}}</ul>";
    var template = Handlebars.compile(source);

    var data = {
        "name": "Alan", "hometown": "Somewhere, TX",
        "kids": [{ "name": "Jimmy", "age": "12" }, { "name": "Sally", "age": "4" }]
    };
    var templateResult = template(data);

    const jsdom = require("jsdom");
    const { JSDOM } = jsdom;

    const dom = new JSDOM(templateResult)
    console.log(dom.window.document.querySelector("p").textContent);
})
module.exports = {}