// cspell:disable
export { };
    
// ====== Variables ====
let UserName = 'Zoki';

type StringOrNum = string | number;
// Union type
let userId: StringOrNum = 'zoran';
userId = 123;

// ====== OBJECTS ====
// Type Object nije preporucljivo, ne daje nam hintove o strukturi objekta
let users : object; 

let user: {
    name: string;
    age: number;
    isAdmin: boolean;
    id: string | number;
};

user = {
    name: 'Zoki',
    age: 34,
    isAdmin: true,
    id: 'abc' // 123
}

// ====== ARRAY ====
// Array type require related type
//let hobbies: Array<string>;
let hobbies: string[]; //short from Array<string>;
hobbies = ['Sports', 'Cooking', 'Reading'];

let brojevi: number[];
brojevi = [1, 2, 3, 4, 5]; 

// ====== FUNCTIONS ====
// za return ne treba type da se definise
function mix(a: number, b: {}, c:string, l:[]) {
    
}

function add(a: number, b: number) {
    return a + b;
}

// mozemo koristiti funkcije kao VALUES
function calculate (
    a: number,
    b: number,
    calcFn: (a: number, b: number) => number //function types
    ){ 
        calcFn(a, b);
}

calculate(2, 5, add);
    
// ====== TYPES ======
type UserType = {
    name: string;
    age: number;
    isAdmin: boolean;
    id: string | number;
}

let user1: UserType;

// Create custom Types 
type AddFnType = (a: number, b: number) => number //function types

// mozemo koristiti funkcije kao VALUES
function calculate1(
    a: number,
    b: number,
    calcFn: AddFnType
    ){ 
        calcFn(a, b);
}

// ====== INTERFACES for Objects and for usign them in CLASS based components====
interface Zoki { };
interface CredentaialInterface {
    password: string;
    email: string;
}

// interfance can be easely extend, type can't
interface CredentaialInterface { 
    userName: string;
}

let creds:CredentaialInterface;
creds = {
    password: 'asqsasasa',
    email: 'zoki@gmail.com',
    userName:'Zoki'
}

class AuthCredentials1 implements CredentaialInterface {
    //implements ništa ne dodaje u klasu. Samo proverava da klasa već ima ta polja. Ne kopira ih iz interfejsa.
    // Interfejs je spisak zahteva: „objekat mora imati password, email i userName“. Posle kompajliranja ne ostaje ništa od njega, u .js fajlu ga nema.
    // Klasa pravi stvarne objekte, pa sama mora da deklariše svoja polja.
    // implements radi kao kontrolor koji poredi klasu sa spiskom. Kad nešto fali, prijavi grešku, ali to što fali ne dodaje sam.
    password: string;
    email: string;
    userName: string;

    constructor(password: string, email: string, userName: string) {
        this.password = password;
        this.email = email;
        this.userName = userName;
    }
}

// krace isto sto i gore:
class AuthCredentials implements CredentaialInterface {
    constructor(
        public password: string,
        public email: string,
        public userName: string
    ) { }
    //Pravilo: parametar bez public je samo ulazna vrednost, 
    // a public ispred parametra ga pretvara i u polje objekta.
    // Ukratko:
    // TypeScript, kad vidi public ispred parametra konstruktora, sam napiše dve stvari umesto tebe:
    // deklaraciju polja u klasi (password: string;)
    // dodelu u konstruktoru (this.password = password;)
    // Bez public, parametar postoji samo dok se konstruktor izvršava, pa nestane.
    // Sa public, TS sam doda this.x = x, pa vrednost ostaje u objektu.
}


function login(credentials: CredentaialInterface) {
    console.log('login');
}

login(new AuthCredentials('asqsasasa', 'zoki@gmail.com', 'Zoki'));


// ====== MERGING TYPES ======
type Admin = {
    permissions: string[];
}

type AppUser = {
    userName: string;
}
 
// merging types
type AppAdmin = Admin & AppUser;

let admin: AppAdmin;
admin = {
    userName: 'Zoki',
    permissions: ['admin']
}

// merging interfaces

interface Admin1 {
    permissions: string[];
}

interface AppUser1 {
    userName: string;
}
 
// merging interface
interface AppAdmin1 extends Admin, AppUser {}

let admin1: AppAdmin1;
admin1 = {
    userName: 'Zoki',
    permissions: ['admin']
}

// ====== LITERAL TYPES (specific value to be used only) ======
type Role = 'admin' | 'user' | 'editor';
let role: Role | 123

role = 'admin';
//role = 'zoki' // error
role = 123;
// role = 1234; // error

// ====== TYPE GUAEDS ==================

function performAction(action: string | number, role: Role) {
    // we check the type before we execute
    if (role === 'admin' && typeof action === 'string') { 
        console.log('admin with string');
    }
}

// Use JavaScript's 'typeof' operator as shown above to check if you're dealing with a string, number, boolean, object, function, symbol or bigint type
// Use JavaScript's 'instanceof' operator to check if an object value is based on some specific class
// Use JavaScript's 'in' operator to check if an object contains a specific property

class FileAction {
    constructor(public fileName: string) {}
}

function performAction1(action: string | number | FileAction | Admin | AppUser, role: Role) {
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
let newRoles: Array<Role>;
let oldRoles: Role[]; // same as previous

// Custom type T, or what ever name
// You can use generics in types to make them more flexible. 
// It turns them into a kind of function, 
// which can return different types depending on what you pass in.
type DataStorage<T> = {
    storage: T[];
    add: (data: T) => void; // void znaci, funckija nista ne vraca
    // calculate: (data: T) => T; // ima return, vrca isti tip
}

const textStorage: DataStorage<string> = {
    storage: [],
    add(data) { 
        this.storage.push(data);
    }
}

type User = {
    firstName: string;
    lasttName: string;
}
const userStorage: DataStorage<User> = {
    storage: [],
    add(user) { }
}

// generic function
function merge<T, U>(a: T, b: U) {
    return {
        ...a,
        ...b,
    }
}

const newUser2 = merge(
    { name: 'Zoki' },
    {age: 43}
)

console.log('newUser2:', newUser2);