<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/me">Me</router-link> | 
    <router-link to="/meetings">Meetings</router-link> | 
    <router-link to="/schedule">Schedule</router-link> | 
    <router-link to="/login">Login</router-link>
  </div>
  <router-view/>
</template>

<script type="text/javascript">
  export default {
    created() {
      // Initializes config.json settings at application creation
      this.$store.dispatch('init');
    }
  }
</script>

<style lang="scss">
/*
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}*/
</style>
