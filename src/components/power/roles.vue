<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加最好放一行里 -->
      <el-row>
        <el-col>
          <!-- 添加角色按钮区域，type=改变样式 -->
          <el-button type="primary">
            添加角色
          </el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <!-- :data绑定数据源 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 栅格组件，分为24格 -->
            <!-- 因为是动态绑定，所以前面加上:，里面不能写字符串，要写一个数组，然后写三元表达式 -->
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限，span="5" 表示占五列 -->
              <el-col :span="5">
                <el-tag  closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
              <!-- 在后面添加一个小图标 -->
              <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 removeRightById可以直接把对应的数据传过去， item3.id代表要删除的id -->
                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">
                      {{item3.authName}}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre>> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <!-- 角色名称列 -->
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <!-- 角色描述列 -->
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="300px">
          <!-- 作用域插槽，scope接收所有数据 -->
          <template slot-scope="scope">
            <!-- 按钮图标 -->
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="xiugai(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row.id)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed">
      <!-- 树形结构控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
      <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 修改表单对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="xiugaiDialogVisible"
      width="50%">
      <!-- 表单 -->
      <!-- <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="活动名称">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
      </el-form>> -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="xiugaiDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="xiugaiDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolelist: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的数据
      rightslist: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [],
      // 当前即将分配权限的角色ID
      roleId: '',
      // 修改用户信息对话框
      xiugaiDialogVisible: false
    }
  },
  // 声明周期函数，在里面获取所有角色的列表数据
  created () {
    // 因为还没有定义，所以在methods中创建这个函数
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表，用await async来简化这次异步的网络请求
    async getRolesList () {
      // 解构赋值形式从对象中解构出data属性，并重命名为res
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolelist = res.data
      console.log(this.rolelist)
    },
    // 根据ID删除对应的权限标签
    async removeRightById (role, rightId) {
      // 弹框提示用户是否要删除，使用MessageBox
      const confirmRsult = await this.$confirm('此操作将永久删除权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRsult !== 'confirm') {
        return this.$message.info('取消了删除！')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败！')
      }
      this.$message.success('删除权限成功！')
      // 解决删除后展开页刷新闭合的问题
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('/rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败！')
      }
      // 获取到的权限数据保存到data中
      this.rightslist = res.data
      // console.log(this.rightslist)
      // 递归获取三级节点的Id
      // console.log(this.defKeys)
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 defKeys数组中
    // 要有一个节点进行判断是否是三级节点，还要有一个数组进行保存
    getLeafKeys (node, arr) {
      if (!node.children) {
        // 如果当前node节点不包含children属性，则是三级节点
        return arr.push(node.id)
      }
      // 如果包含children，则进行递归
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
      // 通过展开运算符放到数组中
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // console.log(keys)
      // 形成一个已逗号拼接的字符串
      const idStr = keys.join(',')
      // 后面的请求体需要传递一个rids字符串，它的值是刚才拼接出来的idStr
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败！')
      }
      this.$message.success('分配权限成功！')
      // 分配成功后刷新列表
      this.getRolesList()
      // 隐藏对话框
      this.setRightDialogVisible = false
    },
    async xiugai (id) {
      // console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户失败！')
      }
      this.xiugaiDialogVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee
}
.bdbottom {
  border-bottom: 1px solid #eee
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
