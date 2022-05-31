class Usercontroller {

    constructor(formIdCreate, formIdUpdate, tableId) {

        this.formEl = document.getElementById(formIdCreate)
        this.formUpdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId)

        this.onSubmit()
        this.onEdit()
        this.selectAll()

    }

    onEdit() {

        document.querySelector("#btn-cancel").addEventListener("click", e => {

            this.showPanelCreate()
        })

        this.formUpdateEl.addEventListener("submit", e => {

            e.preventDefault()

            let values = this.getvalues(this.formUpdateEl)

            let index = this.formUpdateEl.dataset.trIndex

            let tr = this.tableEl.rows[index]

            let userOld = JSON.parse(tr.dataset.user)

            let result = Object.assign({}, userOld, values)

            let user = new User()

            user.loadFromJSON(result)

            user.save()

            this.getTr(user, tr)

            this.formUpdateEl.reset()
            
            this.updateInfo()
            
            this.showPanelCreate()

        })


    }

    onSubmit() {

        this.formEl.addEventListener("submit", event => {

            event.preventDefault()

            let btn = this.formEl.querySelector("[type=submit]")

            btn.disabled = false

            let values = this.getvalues(this.formEl)

            values.save()

            this.addNewUser(values)

            this.formEl.reset()

            this.updateInfo()

        })
    }

    getvalues(formEl) {

        let user = {};

        let isValid = true;

        [...formEl.elements].forEach((filde) => {

            if (["name", "email", "password"].indexOf(filde.name) > -1 && !filde.value) {

                filde.parentElement.classList.add("has-error")

                isValid = false
            }
            if (filde.name == "gender") {

                if (filde.checked) {

                    user[filde.name] = filde.value
                }

            } else if (filde.name == "admin") {

                user[filde.name] = filde.checked

            } else {

                user[filde.name] = filde.value

            }
            if (["name", "email", "password"].indexOf(filde.name) > -1 && filde.value) {

                filde.parentElement.classList.remove("has-error")

            }


        });

        if (!isValid) {

            return false;
        }

        return new User(

            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.admin
        )
    }

    selectAll(){
        

        let users = User.getUsersStorage()

        users.forEach(dataUser=>{

            let user = new User();

            user.loadFromJSON(dataUser)

            this.addNewUser(user)
        })
        
    }

    addNewUser(dataUser) {

        let tr = this.getTr(dataUser)

        this.tableEl.appendChild(tr)

        this.updateInfo()
    }

    getTr(dataUser, tr = null){

        if(tr === null) tr = document.createElement("tr");

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
            <tr>
                <td>${dataUser.name}</td>
                <td>${dataUser.email}</td>
                <td>${(dataUser.admin) ? "sim" : "não"}</td>
                <td>${Utils.formatDate(dataUser.register)}</td>
                <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                </td>
            </tr>
        `;

        this.addEventTr(tr)

        return tr

    }


    addEventTr(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", e => {

            if (confirm("Deseja realmente excluir?")) {

                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove();

                tr.remove();

                this.updateInfo()

            }

        });

        tr.querySelector(".btn-edit").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.user)

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex

            for (let name in json) {

                let filde = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]");

                if (filde) {

                    switch (filde.type) {
                        case "radio":
                            filde = this.formUpdateEl.querySelector("[name=" + name.replace("_", "") + "]" + "[value=" + json[name] + "]");
                            filde.checked = true
                            break
                        case "checkbox":
                            filde.checked = json[name]
                            break
                        case "file":
                            continue;
                            break
                        default:
                            filde.value = json[name]
                    }
                }

            }

            this.updateInfo()

            this.showPanelUpdate()
        });
    }

    showPanelUpdate() {

        document.querySelector("#box-btn-create").style.display = "none";
        document.querySelector("#box-btn-update").style.display = "block";

    }
    showPanelCreate() {

        document.querySelector("#box-btn-create").style.display = "block";
        document.querySelector("#box-btn-update").style.display = "none";

    }

    updateInfo() {

        let numberUsers = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {

            numberUsers++;

            let user = JSON.parse(tr.dataset.user)

            if (user._admin) numberAdmin++

        })

        document.querySelector("#number-users").innerHTML = numberUsers
        document.querySelector("#number-users-admin").innerHTML = numberAdmin


    }

}