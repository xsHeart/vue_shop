<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 创建一个table表格，:data绑定数据源 -->
      <el-table :data="rightsList" broder stripe>
        <!-- 创建一个索引列，指定一个type属性 -->
        <el-table-column type="index"></el-table-column>
        <!-- 权限名称列，label=指定标题，具体属性值用prop进行指定=authName -->
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <!-- 路径，同上 -->
        <el-table-column label="路径" prop="path"></el-table-column>
        <!-- 权限等级，同上 -->
        <el-table-column label="权限等级" prop="level">
          <!-- 因为要渲染，所以通过作用域插槽形式，自定义输出格式 -->
          <!-- 添加slot-scope="scope"，用scope来接收所有数据 -->
          <template slot-scope="scope">
            <!-- 添加v-if判断为几级标签 -->
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 权限列表
      rightsList: []
    }
  },
  // 在声明周期created时发起请求
  created () {
    // 获取所有权限数据
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    async getRightsList () {
      // 发起get请求，值直接写死，表示请求的是列表形式，还可以请求tree形式（树状显示权限）
      // get函数会返回一个porlise（大概是这么个读法）对象，所以用await简化
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        // 获取失败return错误信息
        return this.$message.error('获取权限列表失败！')
      }
      // 没有return表示成功，把获取到的数据挂载到data的rightsList中供页面的模板结构使用
      this.rightsList = res.data
      console.log(this.rightsList)
    }
  }
}
</script>
<style lang="less" scoped>
</style>
