// ====== Variables ====
let UserName = 'Zoki';
// Union type
let userId = 'zoran';
userId = 123;
// ====== OBJECTS ====
// Type Object nije preporucljivo, ne daje nam hintove o strukturi objekta
let users;
let user;
user = {
    name: 'Zoki',
    age: 34,
    isAdmin: true,
    id: 'abc' // 123
};
// ====== ARRAY ====
// Array type require related type
//let hobbies: Array<string>;
let hobbies; //short from Array<string>;
hobbies = ['Sports', 'Cooking', 'Reading'];
let brojevi;
brojevi = [1, 2, 3, 4, 5];
// ====== FUNCTIONS ====
// za return ne treba type da se definise
function mix(a, b, c, l) {
}
function add(a, b) {
    return a + b;
}
// mozemo koristiti funkcije kao VALUES
function calculate(a, b, calcFn //function types
) {
    calcFn(a, b);
}
calculate(2, 5, add);
let user1;
// mozemo koristiti funkcije kao VALUES
function calculate1(a, b, calcFn) {
    calcFn(a, b);
}
;
let creds;
creds = {
    password: 'asqsasasa',
    email: 'zoki@gmail.com',
    userName: 'Zoki'
};
class AuthCredentials1 {
    //implements ništa ne dodaje u klasu. Samo proverava da klasa već ima ta polja. Ne kopira ih iz interfejsa.
    // Interfejs je spisak zahteva: „objekat mora imati password, email i userName“. Posle kompajliranja ne ostaje ništa od njega, u .js fajlu ga nema.
    // Klasa pravi stvarne objekte, pa sama mora da deklariše svoja polja.
    // implements radi kao kontrolor koji poredi klasu sa spiskom. Kad nešto fali, prijavi grešku, ali to što fali ne dodaje sam.
    password;
    email;
    userName;
    constructor(password, email, userName) {
        this.password = password;
        this.email = email;
        this.userName = userName;
    }
}
// krace isto sto i gore:
class AuthCredentials {
    password;
    email;
    userName;
    constructor(password, email, userName) {
        this.password = password;
        this.email = email;
        this.userName = userName;
    }
}
function login(credentials) {
    console.log('login');
}
login(new AuthCredentials('asqsasasa', 'zoki@gmail.com', 'Zoki'));
let admin;
admin = {
    userName: 'Zoki',
    permissions: ['admin']
};
let admin1;
admin1 = {
    userName: 'Zoki',
    permissions: ['admin']
};
let role;
role = 'admin';
//role = 'zoki' // error
role = 123;
// role = 1234; // error
// ====== TYPE GUAEDS ==================
function performAction(action, role) {
    // we check the type before we execute
    if (role === 'admin' && typeof action === 'string') {
        console.log('admin with string');
    }
}
// Use JavaScript's 'typeof' operator as shown above to check if you're dealing with a string, number, boolean, object, function, symbol or bigint type
// Use JavaScript's 'instanceof' operator to check if an object value is based on some specific class
// Use JavaScript's 'in' operator to check if an object contains a specific property
class FileAction {
    fileName;
    constructor(fileName) {
        this.fileName = fileName;
    }
}
function performAction1(action, role) {
    // 1) typeof -> primitive values (string, number, boolean, ...)
    if (typeof action === 'string') {
        console.log(role, 'string action:', action.toUpperCase()); // TS knows: string
        return;
    }
    if (typeof action === 'number') {
        console.log(role, 'number action:', action.toFixed(2)); // TS knows: number
        return;
    }
    // 2) instanceof -> object created from a specific class
    if (action instanceof FileAction) {
        console.log(role, 'file action:', action.fileName); // TS knows: FileAction
        return;
    }
    // 3) in -> object has a specific property (works for types/interfaces, which don't exist at runtime)
    if ('permissions' in action) {
        console.log(role, 'admin action:', action.permissions.join(', ')); // TS knows: Admin
        return;
    }
    console.log(role, 'user action:', action.userName); // only AppUser is left
}
performAction1('save', 'admin');
performAction1(42, 'user');
performAction1(new FileAction('report.pdf'), 'editor');
performAction1({ permissions: ['read', 'write'] }, 'admin');
performAction1({ userName: 'Zoki' }, 'user');
// ====== GENERIC TYPES ==================
let newRoles;
let oldRoles; // same as previous
const textStorage = {
    storage: [],
    add(data) {
        this.storage.push(data);
    }
};
const userStorage = {
    storage: [],
    add(user) { }
};
// generic function
function merge(a, b) {
    return {
        ...a,
        ...b,
    };
}
const newUser2 = merge({ name: 'Zoki' }, { age: 43 });
console.log('newUser2:', newUser2);
export {};
