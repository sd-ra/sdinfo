<template>
    <div id="login">
        <div>
            <img alt="Vue logo" src="../assets/sdlogo.png">
            <br>
            <h3>Willkommen bei der Informationsmanagement-App SDinfo</h3>
            <br>
        </div>
        <div class="form-inputs">
            <input type="text" id="username" ref="username" v-model="input.username" placeholder="Benutzername" />
        </div>
        <div class="form-inputs">
            <input type="password" id="password" v-model="input.password" placeholder="Kennwort" />
        </div>
        <p>{{message}}</p>
        <button type="button" v-on:click="login()">Anmelden</button>
    </div>
</template>

<script>
    import { DxTextBox, DxButton } from 'devextreme-vue';

    export default {
        name: 'Login',
         components: {
            DxTextBox,
            DxButton,
        },
        data() {
            return {
                input: {
                    username: "",
                    password: ""
                },
                message: ""
            }
        },
        methods: {
            login() {
                if(this.input.username != "" && this.input.password != "") {
                    
                    // Benutzer und Kennwort prüfen (01.07.20 ra)
                    let authOk = false;
                    this.$parent.userList.forEach(user => {
                        if(this.input.username == user.Name && this.input.password == user.Passwort) {
                            authOk = true;
                            this.$parent.userName = this.input.username;
                        }
                    });

                    // This should actually be an api call not a check against this.$parent.mockAccount
                    //if(this.input.username == this.$parent.mockAccount.username && this.input.password == this.$parent.mockAccount.password) {
                    if(authOk) {
                        this.$emit("authenticated", true);
                        this.$router.replace({ name: "Datagrid" });
                    } else {
                        //console.log("The username and / or password is incorrect");
                        this.message = "Name oder Kennwort nicht korrekt."
                    }
                } else {
                    console.log("Name und Kennwort eingeben.");
                }
            }
        }
    }
</script>

<style>

#login .form-inputs {
    padding-bottom: 10px;
}

#login .form-inputs label {
    padding-right: 10px;
}

</style>