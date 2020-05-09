const functions = require('firebase-functions');
var firebase = require("firebase/app");
require('firebase/database');
const https = require('https');
const express = require('express');
const request = require('request');
const persianDate = require('persian-date');
const app = express();
const API_TOKEN = '/bot1184961293:AAGKL5i7zSoEoJOOuJ7Mosr2r5kI4neFZOc';
const BASE_URL = 'https://api.telegram.org';
const DEFAULT = -1;
const APP_NAME = 'JobSalaryApp'

const STATE_IDLE = 0;
const STATE_PAY_PER_HOURE = 2;
const STATE_SET_MONTH_HOURE = 3;

var config = {
  databaseURL: "https://ml-kit-codelab-8083b.firebaseio.com",
};

firebase.initializeApp(config);
var database = firebase.database();


function sendHomeKeyboard(response,chatId,text,message_id=DEFAULT){
  const key1 = inlineKeyboardButton("واریزی جدید","واریزی جدید")
  const key2 = inlineKeyboardButton("لیست واریزی ها","لیست واریزی ها")
  const key3 = inlineKeyboardButton("تنظیمات","تنظیمات")
  const keyboard = inlineKeyboardMarkup([[key2, key1],[key3]])

  if(message_id === DEFAULT)
    sendMessage(response,chatId,text,keyboard);
  else
    editMessageText(response,keyboard,text,chatId,message_id);  
}

function sendSettingKeyboard(response,chat_id,message_id,text){
  const key1 = inlineKeyboardButton("دستمزد جدید","دستمزد جدید")
  const key2 = inlineKeyboardButton("دستمزد فعلی","دستمزد فعلی")
  const key3 = inlineKeyboardButton("بازگشت","بازگشت")
  const keyboard = inlineKeyboardMarkup([[key2, key1],[key3]])

  editMessageText(response,keyboard,text,chat_id,message_id);
}

function sendMonthKeyboard(response,chat_id,message_id,text){
  const key1 = inlineKeyboardButton("فروردین","farvardin")
  const key2 = inlineKeyboardButton("اردیبهشت","ordibehesht")
  const key3 = inlineKeyboardButton("خرداد","khordad")
  const key4 = inlineKeyboardButton("تیر","tir")
  const key5 = inlineKeyboardButton("مرداد","mordad")
  const key6 = inlineKeyboardButton("شهریور","shahrivar")
  const key7 = inlineKeyboardButton("مهر","mehr")
  const key8 = inlineKeyboardButton("آبان","aban")
  const key9 = inlineKeyboardButton("آذر","azar")
  const key10 = inlineKeyboardButton("دی","day")
  const key11 = inlineKeyboardButton("بهمن","bahman")
  const key12 = inlineKeyboardButton("اسفند","esfand")
  const key13 = inlineKeyboardButton("بازگشت","بازگشت")
  const keyboard = inlineKeyboardMarkup([[key3, key2, key1],[key6,key5,key4],[key9,key8,key7],[key12,key11,key10],[key13]])

  editMessageText(response,keyboard,text,chat_id,message_id);
}

function answerCallbackQuery(response, callback_query_id, text=DEFAULT, show_alert=DEFAULT, url=DEFAULT, cache_time=DEFAULT){
  var element = {
    "callback_query_id": callback_query_id,
  }

  if(text !== DEFAULT){
    element["text"] = text
  }

  if(show_alert !== DEFAULT){
    element["show_alert"] = show_alert
  }

  const data = JSON.stringify(element);

  request.post({
    headers:{'Content-Type': 'application/json'},
    encoding: 'utf-8',
    url:BASE_URL + API_TOKEN + '/answerCallbackQuery',
    body:data,
  },
  function(err, res, body){
    if(err){
      console.log();
    }
    response.end()
  });
}

function editMessageText(response, reply_markup, text, chat_id, message_id, inline_message_id=DEFAULT, parse_mode=DEFAULT, disable_web_page_preview=DEFAULT){
  var element = {
    "text": text,
    "chat_id": chat_id,
    "message_id": message_id,
    "reply_markup": reply_markup
  }

    
  const data = JSON.stringify(element);
  console.log("edit: " + data)
  console.log("edit: " + message_id)
  request.post({
    headers:{'Content-Type': 'application/json'},
    encoding: 'utf-8',
    url:BASE_URL + API_TOKEN + '/editMessageText',
    body:data,
  },function(err, res, body){
    if(err){
      console.log();
    }
    response.end()
  });
}

function sendMessage(response,chat_id,text,reply_markup=DEFAULT,parse_mode=DEFAULT,disable_web_page_preview=DEFAULT,disable_notification=DEFAULT,reply_to_message_id=DEFAULT){
  var element = {
    "chat_id": chat_id,
    "text": text
  }

  if(reply_markup !== DEFAULT){
    console.log(reply_markup)
    element["reply_markup"] = reply_markup;
  }
  
  const data = JSON.stringify(element);
  console.log(data)

  request.post({
    headers:{'Content-Type': 'application/json'},
    encoding: 'utf-8',
    url:BASE_URL + API_TOKEN + '/sendMessage',
    body:data,
  },function(err, res, body){
    if(err){
      console.log();
    }
    response.end()
  });

}

function keyboardButton(text,request_contact=DEFAULT,request_location=DEFAULT,request_poll=DEFAULT){
  var element = {
    "text": text
  }

  return element
}

function inlineKeyboardButton(text,callback_data,url=DEFAULT,login_url=DEFAULT,switch_inline_query=DEFAULT,switch_inline_query_current_chat=DEFAULT,callback_game=DEFAULT,pay=DEFAULT){
  var element = {
    "text": text,
    "callback_data":callback_data
  }
  return element
}

function replyKeyboardMarkup(arrayOfArrayKeyboard,resize_keyboard=DEFAULT,one_time_keyboard=DEFAULT,selective=DEFAULT){
  var element = {
    "keyboard":arrayOfArrayKeyboard
  }

  return JSON.stringify(element)
}

function inlineKeyboardMarkup(arrayOfArrayInlineKeyboard){
  var element = {
    "inline_keyboard":arrayOfArrayInlineKeyboard
  }

  return element
}

function getUserFromDb(req, res){
  return database.ref(APP_NAME + '/users/' + req.body.message.from.id).once('value').then(function(snapshot){
    return snapshot.val()
  });
}

function getUserState(req, res){
  return database.ref(APP_NAME + '/users/' + req.body.message.from.id).once('value').then(function(snapshot){
    return snapshot.val().state
  });
}

function createNewUser(req, res){
  name = ''
  if(req.body.message.chat.first_name){
    name += req.body.message.chat.first_name;
  }

  if(req.body.message.chat.last_name){
    name += " ";
    name += req.body.message.chat.last_name;
  }
  database.ref(APP_NAME + '/users/' + req.body.message.from.id ).set({
    name: name,
    state: 0
  });
}

function updateState(req, res, userId ,state){
  database.ref(APP_NAME + '/users').child(userId).update({state:state})
}

function setPayPerHour(req, res){
  setting = {
    unit:'تومان',
    pay_per_hour: req.body.message.text
  }
  database.ref(APP_NAME + '/users').child(req.body.message.from.id).update({setting:setting})
  sendMessage(res, req.body.message.from.id, 'دستمزد با موفقیت ثبت شد.')
  updateState(req, res, req.body.message.from.id, STATE_IDLE)
  sendHomeKeyboard(res, req.body.message.from.id, 'منوی اصلی')
}

function setHoureInMonth(req, res){
  var now = new persianDate();
  database.ref(APP_NAME + '/users/' + req.body.message.from.id).once('value').then(function(snapshot){
    var month = snapshot.val().selected_month
    database.ref(APP_NAME + '/users/'+ req.body.message.from.id +'/pays/' + now.year() + '/' + month).update({houre:req.body.message.text})
    sendMessage(res, req.body.message.from.id, 'ساعت با موفقیت ثبت شد.')
    updateState(req, res, req.body.message.from.id, STATE_IDLE)
    sendHomeKeyboard(res,req.body.message.from.id,'منوی اصلی')

    return 0;
  })  .catch(error => { });
}

function performStartAction(req, res){
  getUserFromDb(req, res).then(function(user){

    msg = 'خوش آمدید ';
    if(req.body.message.chat.first_name){
      msg += req.body.message.chat.first_name;
    }
    if(req.body.message.chat.last_name){
      msg += ' ';
      msg += req.body.message.chat.last_name;
    }
    
    if(user === null){
      createNewUser(req, res);
      sendHomeKeyboard(res, req.body.message.chat.id, msg)
    }
  
    else{
      updateState(req, res,req.body.message.from.id, 10)
      sendHomeKeyboard(res, req.body.message.chat.id, msg)
    }
  
    return user;
  }).catch(error => { })

}

function performSettingAction(req, res){
  answerCallbackQuery(res,req.body.callback_query.id)
  sendSettingKeyboard(res, req.body.callback_query.from.id, req.body.callback_query.message.message_id ,'انجام تنظیمات')
}

function performReturnAction(req, res){
  updateState(req, res, req.body.callback_query.from.id, STATE_IDLE);
  answerCallbackQuery(res,req.body.callback_query.id)
  sendHomeKeyboard(res,req.body.callback_query.from.id,'منوی اصلی',req.body.callback_query.message.message_id)
}

function perfromPayPerHourAction(req, res){
  updateState(req, res, req.body.callback_query.from.id, STATE_PAY_PER_HOURE);
  answerCallbackQuery(res,req.body.callback_query.id)
  sendMessage(res, req.body.callback_query.from.id, 'دستمزد ساعتی خود را وارد کنید:')
}

function performNewPayAction(req, res){
  database.ref(APP_NAME + '/users/' + req.body.callback_query.from.id).once('value').then(function(snapshot){
    if(snapshot.val().setting === null){
      answerCallbackQuery(res,req.body.callback_query.id,"در بخش تنظیمات، حقوق ساعتی خود را وارد کنید.", true)
    }

    else{
      sendMonthKeyboard(res, req.body.callback_query.from.id, req.body.callback_query.message.message_id, 'انتخاب ماه: ')
      answerCallbackQuery(res,req.body.callback_query.id)
    }
    return 0;
  }).catch(error => { });

}

function performMonthAction(req, res){

  var now = new persianDate();
  var month = req.body.callback_query.data;

  database.ref(APP_NAME + '/users').child(req.body.callback_query.from.id).update({selected_month:month})
  database.ref(APP_NAME + '/users/'+ req.body.callback_query.from.id +'/pays/'+ now.year() + '/' + month).set({houre:0})

  updateState(req, res, req.body.callback_query.from.id, STATE_SET_MONTH_HOURE);
  answerCallbackQuery(res,req.body.callback_query.id)
  sendMessage(res, req.body.callback_query.from.id, 'مقدار ساعت کاری در این ماه را وارد کنید:')
}

function performCurrentPayPerHoureAction(req,res){
  database.ref(APP_NAME + '/users/' + req.body.callback_query.from.id).once('value').then(function(snapshot){

  if(snapshot.val().setting === null){
    answerCallbackQuery(res,req.body.callback_query.id,"تا حالا دستمزدی وارد نکرده اید.", true)
  }

  else{
    answerCallbackQuery(res,req.body.callback_query.id,"ساعتی " + snapshot.val().setting.pay_per_hour + ' تومان', true)
  }

  return 0;
}).catch(error => { }); 
}

function performGetPaysAction(req, res){
  var now = new persianDate();

  database.ref(APP_NAME + '/users/' + req.body.callback_query.from.id).once('value').then(function(snapshot){

    if(snapshot.val().pays === null){
      answerCallbackQuery(res,req.body.callback_query.id,"تا حالا واریزی نداشته اید.", true)
    }
  
    else{
      answerCallbackQuery(res,req.body.callback_query.ids)
      sendMessage(res, req.body.callback_query.from.id, snapshot.val().pays)
      updateState(req, res, req.body.callback_query.from.id, STATE_IDLE)
      sendHomeKeyboard(res,req.body.callback_query.from.id,'منوی اصلی')
    }

    return 0;
  }).catch(error => { });
}

app.post('/1184961293', (req, res) => {

  if(null !== req.body.callback_query){
    switch(req.body.callback_query.data){
      case 'تنظیمات':
        performSettingAction(req, res);
        break;
      case 'بازگشت':
        performReturnAction(req, res);
        break;
      case 'دستمزد جدید':
        perfromPayPerHourAction(req, res);
        break;
      case 'دستمزد فعلی':
        performCurrentPayPerHoureAction(req,res);
        break;  
      case 'واریزی جدید':
        performNewPayAction(req, res);
        break;
      case 'لیست واریزی ها':
        performGetPaysAction(req, res);
        break;  
      case 'farvardin':
        performMonthAction(req, res);
        break;
      case 'ordibehesht':
        performMonthAction(req, res);
        break; 
      case 'khordad':
        performMonthAction(req, res);
        break;
      case 'tir':
        performMonthAction(req, res);
        break;
      case 'mordad':
        performMonthAction(req, res);
        break;  
      case 'shahrivar':
        performMonthAction(req, res);
        break;  
      case 'mehr':
        performMonthAction(req, res);
        break;
      case 'aban':
        performMonthAction(req, res);
        break;
      case 'azar':
        performMonthAction(req, res);
        break;
      case 'day':
        performMonthAction(req, res);
        break; 
      case 'bahman':
        performMonthAction(req, res);
        break; 
      case 'esfand':
        performMonthAction(req, res);
        break;                                        
    }
    console.log(req.body.callback_query.data)
  }

  else if(null !== req.body.message){
    if(req.body.message.text === '/start'){
      performStartAction(req, res)
    }
    else{
      getUserState(req, res).then(function(state){
        if(state === STATE_IDLE){
          performStartAction(req, res);
        }

        else if(state === STATE_PAY_PER_HOURE){
          setPayPerHour(req, res);
        }

        else if(state === STATE_SET_MONTH_HOURE){
          setHoureInMonth(req, res);
        }

        return 0;
      }).catch(error => { })
    }
  }

  res.end()
})

exports.app = functions.https.onRequest(app);