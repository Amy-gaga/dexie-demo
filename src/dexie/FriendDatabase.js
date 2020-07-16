import Dexie from "dexie";

const FriendDB = new Dexie("FriendDatabase"); //可以理解为表名 FriendDatabase
FriendDB.version(1).stores({ friends: "++id,name,age" }); //表字段id name age

export default FriendDB