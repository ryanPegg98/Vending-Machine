//There will be packages that are needed to create the UI
var mysql = require('mysql');//This will be to fetch the datafrom the database
var clear = require('clear');//this will reset the console everytime is is called
var keypress = require('keypress');//This will detect the key presses
var colors = require('colors');//This will allow the interface to be created

// create the objects
function PRODUCT(id, name, quantity, price){
  this.id = id; // This is for the DB reference
  this.name = name; //The displayed item_name
  this.quantity = quantity;//The amount of that product Left
  this.price = price;//This will be the price of the item as a float
}

function USER(id, name, balance){
  this.id = id;//for future development
  this.name = name;
  this.balance = balance;
}

//These variables will be used in all the different functions
var user;//The users information will be stored in here
var mode = 'T';// This will refer to either: Test, Number or Navigation
var max_width = process.stdout.columns - 4;// Maximum width of the window
var selected_row = 0;
var selected_column = 0;

//this function will print the lines stdout
function print_line(line){
  console.log('  ' + line);
}

//this function will format the text to get it to the correct length;
function format_text(string, position, width){
  var space = max_width;// The width is defaulted to the max_width;
  var left = 1;
  var right = 1;
  if(width != null){
    space = width; // if the width is there set that as space
  }
  if(string == null){
    string = ' ';
  }
  space = space - 2;//padding either side
  if(string.length > space){
    return 'ERROR';
  }
  if(position == 'L'){
    //Align the text to the left
    right = right + (space - string.length);
  } else if (position == 'R'){
    //Align the text to the right
    left = right + (space - string.length);
  } else {
    //Centre the string
    var central = space - string.length;
    //in not even one side will be longer than the other
    if(central % 2 != 0){
      central = central + 1;
      left = left + (central / 2);
      right = left - 1;

    } else {
      left = left + (central / 2);
      right = left;
    }
  }
  string = ' '.repeat(left) + string + ' '.repeat(right);
  return string;
}

// This will print headings of the desired width
function build_heading(string, width){
  var heading_width = max_width;
  if(width != null){
    heading_width = width;
  }
  var border_line = colors.bgWhite(' '.repeat(heading_width));
  var blank_line = colors.bgWhite(' ') + ' '.repeat(heading_width - 2) + colors.bgWhite(' ');
  print_line(border_line);
  print_line(blank_line);
  print_line(colors.bgWhite(' ') + colors.bold(format_text(string, null, heading_width - 2)) + colors.bgWhite(' '));
  print_line(blank_line);
  print_line(border_line);
}

//The first task will be to find the users name
function user_name(string, err){
  clear();//reset the interface
  print_line(' ');
  build_heading('Please enter your name...');
  var input_line = '';
  var text_line = format_text(string);
  if(string == null && err != 'empty'){
    input_line = colors.bgBlue.white.bold(' '.repeat(max_width));
    text_line = colors.bgBlue.white.bold(text_line);
  } else if (err == 'correct') {
    input_line = colors.bgGreen.white.bold(' '.repeat(max_width));
    text_line = colors.bgGreen.white.bold(text_line);
  } else {
    input_line = colors.bgRed.white.bold(' '.repeat(max_width));
    text_line = colors.bgRed.white.bold(text_line);
  }
  print_line(input_line);
  print_line(input_line);
  print_line(text_line);
  print_line(input_line);
  print_line(input_line);
  var buttons_1 = colors.bgCyan(' '.repeat(max_width));
  var buttons_2 = colors.bgCyan('  ') + colors.cyan.bold(' '.repeat((max_width / 2) -3)) + colors.bgCyan('  ') + colors.cyan.bold(' '.repeat((max_width / 2) -3)) + colors.bgCyan('  ');
  var buttons_3 = colors.bgCyan('  ') + colors.white.bold(format_text('Press \'ESC\' to exit', null, (max_width / 2) - 3)) + colors.bgCyan('  ') + colors.white.bold(format_text('Press \'Return\' to confirm', null, (max_width /2) - 3)) + colors.bgCyan('  ');
  print_line(buttons_1);
  print_line(buttons_2);
  print_line(buttons_3);
  print_line(buttons_2);
  print_line(buttons_1);
}

// This will build the grid
function build_grid(list){
  var max_columnwidth = 25;
  var column_width = max_width / 4;
  console.log(column_width);
  for(var idx = 0; idx < list.length; idx++){
    var row = list[idx];// This will the be to select the working row
    var selected_line = '';
    var name_line = '';
    for(var idx2 = 0; idx2 < row.length; idx2++){
      var selection = colors.bgWhite(' '.repeat(max_width / 4));
      name_line = name_line + format_text(row[idx2].name, null, max_width / 4);
      if(selected_row == idx && selected_column == idx2){
        selection =colors.bgGreen(' '.repeat(max_width / 4));
      }
      selected_line = selected_line + selection;
    }
    print_line(colors.bgWhite(' '.repeat(max_width)));
    print_line(colors.bgWhite(' '.repeat(max_width)));
    print_line(colors.bgWhite.black.bold(name_line));
    print_line(colors.bgWhite(' '.repeat(max_width)));
    print_line(colors.bgWhite(' '.repeat(max_width)));
    print_line(selected_line);
  }
  //console.log(list);
}

//This will complete FT4
function build_products(){
  // This will use MySQL to find all the products and display them
  clear(); // reset the window
  console.log();// give it a line for looks
  build_heading('STUDENT VENDING MACHINE');// Display the heading
  print_line(colors.bgCyan(' '.repeat(max_width)));
  print_line(colors.bgCyan.white.bold(format_text(' Welcome, ' + user.name, 'L', max_width / 2) + format_text('Your balance is: Â£' + user.balance, 'R', max_width / 2)));// This completes FT5
  print_line(colors.bgCyan(' '.repeat(max_width)));
  //use MySQL to fetch all the results
  var products = mysql.createConnection({
    'host': 'localhost',
    'database': 'rp23249391',
    'user': '23249391',
    'password': 'password'
  });
  products.connect();
  var query = products.format('SELECT `id`, `name`, `quant`, `price` FROM products');
  products.query(query, function(err, result){
    if(err){
      console.log(err);
      return;
    }
    var items = [];
    var products = [];
    for(var idx = 0; idx < result.length; idx++){
      var item = result[idx];
      items.push(new PRODUCT(item['id'], item['name'], item['quantity'], item['price']));
    }
    var rows = items.length / 4;
    for(var idx = 0; idx < rows; idx++){
      var tmp = items.slice(0, 4);
      items = items.slice(4);
      products.push(tmp);
    }
    build_grid(products);
  });
}

//start with the users item_name
var temp_username = '';
var username_state = '';
var username_re = /[aA-zZ]/i;
user_name();

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

//Key press events captured here
process.stdin.on('keypress', function (ch, key) {
  if(mode == 'T'){
    if(key.name != 'return' && key.name != 'escape'){
      if(typeof ch != 'undefined'){
        if(key.name == 'backspace'){
          temp_username = temp_username.slice(0, temp_username.length - 1);
          if(temp_username.length == 0){
            username_state = 'empty';
          }
        } else if(key.ctrl != true && key.name != 'escape') {
          if(typeof temp_username == 'undefined'){
            temp_username = '';
          }
          temp_username = temp_username + ch;
          username_state = 'correct';
        }
        user_name(temp_username, username_state);
        console.log(key);
      }
    } else if(key.name == 'escape'){
      clear(); // clear the page
      console.log();
      build_heading('You have left the system. Please come back again');
      console.log();
      process.exit();
    } else {
      if(temp_username.length > 3){
        mode = 'P';
        user = new USER(1, temp_username, 0);
        temp_username = '';
        build_products();
      } else {
        user_name(temp_username);
      }
    }
  } else if(mode == 'P'){
    if(key && key.name == 'e'){
      process.exit();
    }
  }
})

keypress.enableMouse(process.stdout);


console.log('');
console.log('  Width: ' + max_width);

process.stdin.setRawMode(true);
process.stdin.resume();
