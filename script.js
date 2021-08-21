"use strict"

//IndexedDB

//¿Qué es?: Es una base de datos indexada
//*Almacena información en el navegador de manera similar al local storage
//Permite hacer CRUD: Create Read Update Delete
//Es una base de datos no relacional

//*Es orientada a objetos
//*Es asincrona (real time)
//*Se trabaja con eventos del dom

//indexedDB es una propiedad del objeto window

const IDBRequest = indexedDB.open(/*Nombre de la database*/ "database", 2 /*version*/ ); //con el metodo open abrimos la solicitud de la base de datos, si no existe la creamos, si existe la traemos, recibe dos parametros, nombre de la DB, y la version


IDBRequest.addEventListener("upgradeneeded", () =>{ // Esto nos indicará si la base de datos se creó correctamente
    const db = IDBRequest.result;                   //Aquí obtenemos el resultado que nos generó la solicitud open("", 2);
    console.log("hey");
    
    db.createObjectStore("nombres", { //Su primer parametro es el nombre del objectStore, como segundo parametro recibe un objeto
        autoIncrement: true // El autoincrement hará que cada vez que se cree un nuevo valor éste vaya teniendo un id diferente
    });
});

IDBRequest.addEventListener("success", () => { 
    readObjects();
});

IDBRequest.addEventListener("error", () => {
    console.log("hubo un error");
});


const addObject = obj => {
    if(document.getElementById(obj).value.length > 0){
        if(document.querySelector(".posible") != undefined){
            if(confirm("Hay elementos sin guardar, quieres continuar?")){
                const objectStore = getIDBData("readwrite", "objeto agregado correctamente");
                objectStore.add({nombre: document.getElementById(obj).value});
                readObjects();
            }
        }else{
            const objectStore = getIDBData("readwrite", "objeto agregado correctamente");
            objectStore.add({nombre: document.getElementById(obj).value});
            readObjects();
        }
    }else{
        alert("Debes introducir por lo menos 1 carácter!")
    }
};

const readObjects = () =>{
    const objectStore = getIDBData("readonly")
    const cursor = objectStore.openCursor(); // cursor accederá a los valores que contiene objectStore
    const fragment = document.createDocumentFragment();
    document.querySelector(".nombres").innerHTML = "";
    cursor.addEventListener("success", ()=>{ //Si es completado, me de devolverá una solicitud que tendrá que ser recibida mediante un .result
        if(cursor.result){ // Como nos devolvió un .result que contiene todos los datos, entonces el if se ejecutará
            let elemento = htmlCode(cursor.result.key, cursor.result.value.nombre);
            
            fragment.appendChild(elemento); //Aquí accedemos al valor que contiene result en cada indice
            cursor.result.continue(); //Aquí le diremos que continue leyendo después de cada uno
        }else document.querySelector(".nombres").appendChild(fragment); //Como última vuelta nos dara null por lo cual se ejecutará el else
    });    
};

const modifyObject = (key, obj) => {
    const objectStore = getIDBData("readwrite", "objeto modificado correctamente");
    objectStore.put(obj, key);
};

const deleteObject = key => {
    const objectStore = getIDBData("readwrite", "objeto eliminado correctamente")
    objectStore.delete(key);
};

const getIDBData = (mode, msg) => {
    const db = IDBRequest.result; //Esto nos trae el resultado de la solicitud, "nos trae el objeto a modificar"

    const IDBTransaction = db.transaction("nombres", mode); // Esto da permisos de leer y escribir, modificar, y eliminar cualquier indice

    const objectStore = IDBTransaction.objectStore("nombres"); //Aquí accedemos a los objetos que contiene "nombres";
    IDBTransaction.addEventListener("complete", () =>{ // Esto nos avisará cuando el objeto sea agregado/leido/modificado/eliminado;
  
        console.log(msg)
    });
    return objectStore;
}

const htmlCode = (key, name) => {
    const container = document.createElement("DIV");
    const h2 = document.createElement("H2");
    const options = document.createElement("DIV");
    const saveButton = document.createElement("BUTTON");
    const deleteButton = document.createElement("BUTTON");

    container.classList.add("nombre");
    options.classList.add("options");
    saveButton.classList.add("imposible");
    deleteButton.classList.add("delete");

    saveButton.textContent = "Guardar";
    deleteButton.textContent = "Eliminar";
    h2.textContent = name;
    h2.setAttribute("contenteditable", "true");
    h2.setAttribute("spellcheck", "false");

    h2.addEventListener("keyup", () => {
        saveButton.classList.replace("imposible", "posible");
    });

    saveButton.addEventListener("click", () => {
        if(saveButton.className == "posible"){
            modifyObject(key, {nombre: h2.textContent})
            console.log(key)
            saveButton.classList.replace("posible", "imposible")
        };
    });

    deleteButton.addEventListener("click", () => {
        deleteObject(key);
        console.log(key)
        document.querySelector(".nombres").removeChild(container)
    });

    options.appendChild(saveButton);
    options.appendChild(deleteButton);

    container.appendChild(h2);
    container.appendChild(options);

    return container;
}