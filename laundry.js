/*
@file laundry

laundry counter module
*/

//----Storage and interface definitions

class laundryItem {
    mapping = {
        name: "name",
        qty: "qty",
        bundleQty: "bundleQty"
    };
    bindedObj = null;
    binder(attr) {
        if(this.bindedObj == null) {
            return null;
        }
        return this.bindedObj[this.mapping[attr]];
    }
    getName() {
        return this.binder("name");
    };
    getQty() {
        return this.binder("qty");
    };
    getBundleQty() {
        return this.binder("bundleQty");
    };
    updateQty(qty) {
        this.bindedObj[this.mapping["qty"]] = qty;
    };

    constructor(obj, mapping = this.mapping) {
        this.bindedObj = obj;
        this.mapping = mapping;
    }
}

class laundryCollection {
    names = [];
    addItem(item) {
        this[item.getName()] = item;
        this.names.push(item.getName());
    }
    getItemNames() {
        return this.names;
    }
    constructor() {

    }
}

//----HTML interfacing

class laundryModule {   
    RootElem = null;
    Items = new laundryCollection();
    //Returns top level div container for laundry counting module
    bindLaundryElement(id = "laundryCounter") {
        this.RootElem = document.getElementById(id);
    }
    //Removes all internal elements
    clearChildren() {
        this.RootElem.replaceChildren();
    }
    //Draws an item
    draw(item) {
        var InnerDiv = document.createElement('div');
        InnerDiv.setAttribute("name", item.getName());
        InnerDiv.setAttribute("class", "lcounter");
        this.RootElem.appendChild(InnerDiv);

        var NameElem = document.createElement('p');
        NameElem.setAttribute("desc", "name");
        NameElem.textContent = item.getName();
        NameElem.setAttribute("style", "grid-area:name;");
        InnerDiv.appendChild(NameElem);

        var QtyElem = document.createElement('p');
        QtyElem.setAttribute("desc", "qty");
        QtyElem.textContent = item.getQty();
        QtyElem.setAttribute("style", "grid-area: qty;");
        QtyElem.setAttribute("contenteditable", "true");
        QtyElem.addEventListener("input", (e)=>{
            item.updateQty(Number(QtyElem.textContent));
        });
        InnerDiv.appendChild(QtyElem);

        var BundleQtyElem = document.createElement('p');
        BundleQtyElem.setAttribute("desc", "bundleqty");
        BundleQtyElem.textContent = item.getBundleQty();
        BundleQtyElem.multiplier = [1,5,10,50];
        BundleQtyElem.bundleQty = item.getBundleQty();
        var larger = true;
        for(var i = 0; i < BundleQtyElem.multiplier.length; i++) {
            if(BundleQtyElem.multiplier[i] == BundleQtyElem.bundleQty){
                BundleQtyElem.multSelector = i;
                larger = false;
                break;
            }
            if(BundleQtyElem.bundleQty < BundleQtyElem.multiplier[i]){
                BundleQtyElem.multiplier.splice(i, 0, BundleQtyElem.bundleQty);
                BundleQtyElem.multSelector = i;
                larger = false;
                break;
            }
        }
        if(larger) {
            BundleQtyElem.multiplier.push(BundleQtyElem.bundleQty);
            BundleQtyElem.multSelector = BundleQtyElem.multiplier.length - 1;
        }
        BundleQtyElem.setAttribute("style", "grid-area:bundleqty;");
        BundleQtyElem.addEventListener('click',(e)=> {
            BundleQtyElem.multSelector = (BundleQtyElem.multSelector + 1) % BundleQtyElem.multiplier.length;
            BundleQtyElem.textContent = BundleQtyElem.multiplier[BundleQtyElem.multSelector];
        });
        InnerDiv.appendChild(BundleQtyElem);

        var IncrElem = document.createElement('button');
        IncrElem.setAttribute("desc", "add");
        IncrElem.textContent = "Add";
        IncrElem.setAttribute("style", "grid-area:add;");
        IncrElem.addEventListener('click', (e)=>{   
            if(!item.locked) {
                item.updateQty(item.getQty() + BundleQtyElem.multiplier[BundleQtyElem.multSelector]);
            }
            QtyElem.textContent = item.getQty();
        })
        InnerDiv.appendChild(IncrElem);

        var DecrElem = document.createElement('button');
        DecrElem.setAttribute("desc", "subtract");
        DecrElem.textContent = "Subtract";
        DecrElem.setAttribute("style", "grid-area:subtract");
        DecrElem.addEventListener('click', (e) => {
            if(!item.locked) {
                item.updateQty(item.getQty() - BundleQtyElem.multiplier[BundleQtyElem.multSelector]);
            }
            QtyElem.textContent = item.getQty();
        });
        InnerDiv.appendChild(DecrElem);

        var LockElem = document.createElement('button');
        LockElem.setAttribute("desc", "lock");
        LockElem.textContent = "Lock";
        LockElem.setAttribute("style", "grid-area:lock");
        LockElem.addEventListener('click', () => {
            if(!item.locked) {
                item.locked = true;
                LockElem.textContent = "Unlock";
            } else {
                item.locked = false;
                LockElem.textContent = "Lock";
            }
        });
        InnerDiv.appendChild(LockElem);
    }
    //Adds new item to internal list
    addItem(item) {
        this.Items.addItem(item);
        this.draw(item);
    }
    //Redraws all items
    redraw() {
        this.clearChildren();
        var RedrawButton = document.createElement('button');
        RedrawButton.textContent = "Redraw";
        RedrawButton.addEventListener('click', (e)=>{
            this.redraw();
        });
        this.RootElem.appendChild(RedrawButton);
        this.Items.names.forEach((e) => {
            this.draw(this.Items[e]);
        });
    }
    constructor() {
        this.bindLaundryElement();
        var RedrawButton = document.createElement('button');
        RedrawButton.textContent = "Redraw";
        RedrawButton.addEventListener('click', (e)=>{
            this.redraw();
        });
        this.RootElem.appendChild(RedrawButton);
    }
};

//----Onload

window.onload = function() {
    var LModule = new laundryModule();
    var temp = new laundryItem({name:"Blanket", qty:0, bundleQty:5});
    LModule.addItem(temp);
    var temp2 = new laundryItem({name:"Pillowcase", qty:0, bundleQty:50});
    LModule.addItem(temp2);
    var temp3 = new laundryItem({name: "Bedsheet", qty:0, bundleQty: 10});
    LModule.addItem(temp3);
}

