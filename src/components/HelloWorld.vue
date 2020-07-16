<template>
  <el-container>
    <el-header>
      <el-row>
        <el-button type="primary" plain @click="openDialogByAdd">新增</el-button>
        <el-button type="success" plain @click="handleModify">修改</el-button>
        <el-button type="info" plain @click="handleSearch">查询</el-button>
        <el-button type="danger" plain @click="dialogDeleteVisible = true">删除</el-button>
      </el-row>
    </el-header>
    <el-main>
      <div>
        <el-table :data="tableData" border style="width: 100%">
          <el-table-column prop="id" label="序号" width="180"></el-table-column>
          <el-table-column prop="name" label="姓名" width="180"></el-table-column>
          <el-table-column prop="age" label="年龄"></el-table-column>
          <el-table-column fixed="right" label="操作" width="180">
            <template slot-scope="scope">
              <el-button @click="openDialogByModify(scope.row)" type="text" size="small">编辑</el-button>
              <el-button @click="handleDeleteById(scope.row.id)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div>
        <el-dialog title="我的朋友" :visible.sync="dialogFormVisible" @close="closeDialog('form')">
          <el-form :model="form" ref="form">
            <el-form-item label="姓名" :label-width="formLabelWidth" prop="name">
              <el-input v-model="form.name" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item label="年龄" :label-width="formLabelWidth" prop="age">
              <el-input-number
                v-model.number="form.age"
                controls-position="right"
                :min="1"
                :max="100"
                class="inputnum"
              ></el-input-number>
              <!-- <el-input v-model="form.age" type="number" autocomplete="off" :min="1" :max="100"></el-input> -->
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog('form')">取 消</el-button>
            <el-button v-if="flag === 'modify'" type="primary" @click="handleModify(form.id)">确 定</el-button>
            <el-button v-else type="primary" @click="handleAdd">确 定</el-button>
          </div>
        </el-dialog>
      </div>
      <div>
        <el-dialog
          title="删除朋友"
          :visible.sync="dialogDeleteVisible"
          @close="closeDialog('deleteForm')"
        >
          <el-form :model="deleteForm" ref="deleteForm">
            <el-form-item label="姓名" :label-width="formLabelWidth" prop="name">
              <el-input v-model="deleteForm.name" autocomplete="off"></el-input>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button @click="closeDialog('deleteForm')">取 消</el-button>
            <el-button type="primary" @click="handleDelete">确 定</el-button>
          </div>
        </el-dialog>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import FriendDB from "@/dexie/FriendDatabase.js";
export default {
  name: "HelloWorld",
  props: {},
  data() {
    return {
      tableData: [],
      dialogFormVisible: false,
      dialogDeleteVisible: false,
      flag: "",
      form: {
        id: null,
        name: "",
        age: null
      },
      deleteForm: {
        name: ""
      },
      formLabelWidth: "120px"
    };
  },
  mounted() {
    this.init();
  },

  methods: {
    async init() {
      this.tableData = await FriendDB.friends.toArray();
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    closeDialog(formName) {
      if (formName === "form") {
        this.dialogFormVisible = false;
      }
      if (formName === "deleteForm") {
        this.dialogDeleteVisible = false;
      }
      this.$nextTick(() => {
        this.$refs[formName].resetFields();
      });
    },
    openDialogByAdd() {
      this.flag = "add";
      this.form.id = null;
      this.form.name = "";
      this.form.age = null;
      this.dialogFormVisible = true;
    },
    openDialogByModify(obj) {
      console.log(JSON.stringify(obj));
      this.flag = "modify";
      this.form.id = obj.id;
      this.form.name = obj.name;
      this.form.age = obj.age;
      this.dialogFormVisible = true;
    },
    handleAdd() {
      FriendDB.transaction("rw", FriendDB.friends, async () => {
        // Make sure we have something in DB:
        console.log(`firend name is ${this.form.name}`);
        if (
          (await FriendDB.friends.where({ name: this.form.name }).count()) === 0
        ) {
          const id = await FriendDB.friends.add({
            name: this.form.name,
            age: this.form.age
          });
          console.log(`Addded friend with id ${id}`);
          // this.resetForm("form");
          this.dialogFormVisible = false;
          this.$nextTick(() => {
            this.$refs["form"].resetFields();
          });
          this.handleSearch();
        }
      }).catch(e => {
        alert(e.stack || e);
      });
    },
    handleModify(id) {
      //   //Update Items: Table.put(), Table.bulkPut(), Table.update(), Collection.modify()
      //   await db.friends.put({id: 4, name: "Foo", age: 33});
      //   await db.friends.update(4, {name: "Bar"});
      FriendDB.transaction("rw", FriendDB.friends, async () => {
        await FriendDB.friends
          .where({ id: id })
          .modify({ age: this.form.age, name: this.form.name });
        console.log(`modify`);
        this.dialogFormVisible = false;
        this.$nextTick(() => {
          this.$refs["form"].resetFields();
        });
        this.handleSearch();
        this.flag = null;
      }).catch(e => {
        alert(e.stack || e);
      });
    },
    handleSearch() {
      FriendDB.transaction("rw", FriendDB.friends, async () => {
        const someFriends = await FriendDB.friends
          .where("age")
          .between(20, 25)
          .toArray();
        const youngFriends = await FriendDB.friends
          .where("age")
          .below(25)
          .toArray();
        this.tableData = await FriendDB.friends.toArray();
        console.log(`Friends: ${JSON.stringify(someFriends)}`);
        console.log(`Friends: ${JSON.stringify(youngFriends)}`);
      }).catch(e => {
        alert(e.stack || e);
      });
      //Query Items: Table.where(), WhereClause, Collection
    },
    handleDelete() {
      FriendDB.transaction("rw", FriendDB.friends, async () => {
        // Make sure we have something in DB:
        if (
          (await FriendDB.friends
            .where({ name: this.deleteForm.name })
            .count()) !== 0
        ) {
          await FriendDB.friends.where({ name: this.deleteForm.name }).delete();
          console.log(`Deleted friend`);
          this.dialogDeleteVisible = false;
          this.$nextTick(() => {
            this.$refs["deleteForm"].resetFields();
          });
          this.handleSearch();
        }
      }).catch(e => {
        alert(e.stack || e);
      });
    },
    async handleDeleteById(id) {
      await FriendDB.friends.delete(id);
      this.handleSearch();
    },
    handleClose() {}
    // init() {
    //   //
    //   // Declare Database
    //   //
    //   const db = new Dexie("FriendDatabase"); //可以理解为表名 FriendDatabase
    //   db.version(1).stores({ friends: "++id,name,age" }); //表字段id name age

    //   //Add Items: Table.add() Table.bulkAdd()
    //   await db.friends.add({name: "Josephine", age: 21});
    //   //Update Items: Table.put(), Table.bulkPut(), Table.update(), Collection.modify()
    //   await db.friends.put({id: 4, name: "Foo", age: 33});
    //   await db.friends.update(4, {name: "Bar"});
    //   //Delete items: Table.delete(), Table.bulkDelete(), Collection.delete()
    //   await db.friends.delete(4);
    //   //Query Items: Table.where(), WhereClause, Collection
    //   const someFriends = await db.friends
    //       .where("age").between(20, 25)
    //       .offset(150).limit(25)
    //       .toArray();
    //   Storing Binary Data
    //         var db = new Dexie("MyImgDb");
    //   db.version(1).stores({
    //       friends: "name"
    //   });

    //   // Download and store an image
    //   async function downloadAndStoreImage() {
    //       const res = await fetch("some-url-to-an-image.png");
    //       const blob = await res.blob();
    //       // Store the binary data in indexedDB:
    //       await db.friends.put({
    //           name: "David",
    //           image: blob
    //       });
    //   }
    //   db.transaction("rw", db.friends, async () => {
    //     // Make sure we have something in DB:
    //     if ((await db.friends.where({ name: "Josephine" }).count()) === 0) {
    //       const id = await db.friends.add({ name: "Josephine", age: 21 });
    //       alert(`Addded friend with id ${id}`);
    //     }

    //     // Query:
    //     const youngFriends = await db.friends
    //       .where("age")
    //       .below(25)
    //       .toArray();

    //     // Show result:
    //     alert("My young friends: " + JSON.stringify(youngFriends));
    //   }).catch(e => {
    //     alert(e.stack || e);
    //   });
    // }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #d3dce6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-main {
  background-color: #e9eef3;
  color: #333;
  text-align: center;
  /* line-height: 160px; */
}

body > .el-container {
  margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
  line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
  line-height: 320px;
}
.inputnum {
  width: 100%;
}
</style>
