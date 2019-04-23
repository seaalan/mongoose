var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/mongoose-test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.info('we are connected!');

    // Mongoose 里，一切都始于Schema。
    var Schema = mongoose.Schema;
    var kittySchema = new Schema({
        name: String
    });

    // 允许使用的 SchemaTypes 有String Number Date Buffer Boolean Mixed ObjectId Array Decimal128 Map
    var blogSchema = new Schema({
        title:  String,
        author: String,
        body:   String,
        comments: [{ body: String, date: Date }],
        date: { type: Date, default: Date.now },
        hidden: Boolean,
        meta: {
          votes: Number,
          favs:  Number
        }
    });

    // method 是给 document 用的
    // NOTE: methods must be added to the schema before compiling it with mongoose.model()
    // 实例方法（method）：给实例使用。
    kittySchema.methods.speak = function () {
        var greeting = this.name
          ? "Meow name is " + this.name
          : "I don't have a name";
        console.log(greeting);
    }

    // 静态方法（static）：给model使用
    kittySchema.statics.findByName = function(name, cb) {
        return this.find({ name: new RegExp(name, 'i') }, cb);
    };

    // 查询助手（query helper）：作用于 query 实例，方便你自定义拓展你的 链式查询
    kittySchema.query.byName = function(name) {
        return this.find({ name: new RegExp(name, 'i') });
    };

    // 我们得到了一个带有 String 类型 name 属性的 schema 。 接着我们把这个 schema 编译成一个 Model
    var Kitten = mongoose.model('Kitten', kittySchema);
    Kitten.findByName('Felyne', function(err, kits) {
        console.log('调用静态方法');
        console.log(kits);
    });
    Kitten.find().byName('Felyne').exec(function(err, kits) {
        console.log('调用查询助手');
        console.log(kits);
    });

    // model 是我们构造 document 的 Class。
    var felyne = new Kitten({ name: 'Felyne' });
    console.log('调用实例方法');
    console.log(felyne.name); // 'Felyne'

    // 每个 document 会在调用他的 save 方法后保存到数据库。 注意回调函数的第一个参数永远是 error 。
    felyne.save(function (err, felyne) {
        if (err) return console.error(err);
        felyne.speak(); // "Meow name is felyne"
    });
});