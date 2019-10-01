const budgetController = (() => {
    
    class Expenses {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }
        
        calcPerc(totalInc) {
            if(totalInc > 0) {
                this.percentage = Math.round((this.value / totalInc) * 100);
            } else {
                this.percentage = -1;
            }
        }
        
        getPerc() {
            return this.percentage;
        }
    };
    
    class Incomes {
        constructor(id, description, value){
            this.id = id;
            this.description = description;
            this.value = value; 
        }
    };
    
    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        },
        percentages: -1,
        budget: 0
    };
    
    const addItem = ({ type, description, value }) => {
        let newItem, id;
        
        if (data.allItems[type].length > 0) {
            id = data.allItems[type][data.allItems[type].length - 1].id + 1;
        } else {
            id = 0;
        }
        
        if (description !== '' && value !== '') {
            if (type === 'exp') {
                newItem = new Expenses(id, description, parseFloat(value));
            } else if (type === 'inc') {
                newItem = new Incomes (id, description, parseFloat(value));
            }
        
            data.allItems[type].push(newItem);
        }  
        
        return newItem;
    };
    
    const deleteItem = (type, id) => {
        
        let actualId, index;
        
        actualId = data.allItems[type].map((cur) => {
            return cur.id;
        });
        
        index = actualId.indexOf(id);
        
        if (index !== -1) {
            data.allItems[type].splice(index, 1);
        }
    };
    
    const calculateTotal = (type) => {
        
        let sum;
             
        sum = 0;
        
        if (data.allItems[type].length > 0) {
            
            data.allItems[type].forEach((cur) => {
                sum += cur.value;
            }); 
        }
        
        data.total[type] = sum;
    };
    
    const calculateBudget = () => {
        
        //budget
        calculateTotal('inc');
        calculateTotal('exp');
        
        data.budget = data.total.inc - data.total.exp;
        
        //percentages
        if (data.total.inc > 0) {
            data.percentages = Math.round((data.total.exp / data.total.inc) * 100);
        } else {
            data.percentages = -1;
        }    
    };
    
    
    const calculatePercentages = () => {
        
        data.allItems.exp.forEach((cur) => {
            cur.calcPerc(data.total.inc);
        });
    };
    
    const getPercentages = () => {
        
        let allPerc;
        
        allPerc = data.allItems.exp.map((cur) => {
            return cur.getPerc();
        });
        
        return allPerc;
    };
    
    const getBudget = () => {
        return {
            exp: data.total.exp,
            inc: data.total.inc,
            budget: data.budget,
            percentages: data.percentages
        }
    };
                          
    return {
        addItem,
        calculateBudget,
        getBudget,
        calculatePercentages,
        getPercentages,
        deleteItem
    };
    
})();

const uiController = (() => {
    
    const domStrings = {
        addButton: '.add__btn',
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetValue: '.budget__value',
        incomeValue: '.budget__income--value',
        expenseValue: '.budget__expenses--value',
        percentagesValue: '.budget__expenses--percentage',
        percentegeItem: '.item__percentage',
        month: '.budget__title--month',
        containerDelete: '.container'
    };
    
    const formatNumber = (num, type) => {
        
        num = Math.abs(num);
        num = num.toFixed(2);
        
        numSplit = num.split('.');
        
        int = numSplit[0];
        
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        } 
        
        dec = numSplit[1];
        
        return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
    };
    
    const nodeListForEach = (list, callback) => {
        
        for (i=0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    
    const getInput = () => {
       return {
           type: document.querySelector(domStrings.inputType).value,
           description: document.querySelector(domStrings.inputDescription).value,
           value: document.querySelector(domStrings.inputValue).value
       }; 
    };
    
    const displayItem = ({ id, description, value }, type) => {
        let element, newHtml;
       
        if (type === 'inc') {
           element = document.querySelector(domStrings.incomeContainer);
           newHtml = 
                `<div class="item clearfix" id="inc-${id}">
                    <div class="item__description">${description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatNumber(value, 'inc')}</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                  </div>`;
        } else if (type === 'exp') {
           element = document.querySelector(domStrings.expenseContainer);
           newHtml = 
                `<div class="item clearfix" id="exp-${id}">
                    <div class="item__description">${description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${formatNumber(value, 'exp')}</div>
                        <div class="item__percentage">21%</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                 </div>`;     
        } 
        
        element.insertAdjacentHTML('beforeend', newHtml);   
    };
   
    const clearFields = () => {
       let fields;
       
       // querySelectorAll returns NodeList
       fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);
       
       // slice returns copy array -> little trick -> NodeList converts to Array
       fields = Array.prototype.slice.call(fields);
       
       // we now can loop
       fields.forEach((cur) => {
           cur.value = '';
       });   
    };
    
    const displayBudget = ({ exp, inc, budget, percentages }) => {
        
        //budget
        document.querySelector(domStrings.incomeValue).textContent = formatNumber(inc, 'inc');
        document.querySelector(domStrings.expenseValue).textContent = formatNumber(exp, 'exp');
        document.querySelector(domStrings.budgetValue).textContent = formatNumber(budget, 'exp');
        
        //percentages
        if (percentages > 0) {
           document.querySelector(domStrings.percentagesValue).textContent = percentages + '%'; 
        } else {
           document.querySelector(domStrings.percentagesValue).textContent = '---';
        }    
    };
    
    const displayPercentages = (percentages) => {
        
        let fields = document.querySelectorAll(domStrings.percentegeItem);
        
        nodeListForEach(fields, ((cur, index) => {
            
            if(percentages[index] > 0) {
                cur.textContent = percentages[index] + '%';
            } else {
                cur.textContent = '---';
            }
        }));
        
    };
    
    const changedType = () => {
        
        let fields;
        
        fields = document.querySelectorAll(domStrings.inputType + ',' + domStrings.inputDescription + ',' + domStrings.inputValue);
        
        nodeListForEach(fields, ((cur) => {
            cur.classList.toggle('red-focus');
        }));
        
        document.querySelector(domStrings.addButton).classList.toggle('red');
    };
    
    const displayMonth = () => {
        
        let now, fullYear, month;
        
        now = new Date;
        
        fullYear = now.getFullYear();
        month = now.getMonth();
        
        nameMonth = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        document.querySelector(domStrings.month).textContent = nameMonth[month] + ' ' + fullYear;
    }
    
    const deleteDisplayItem = (id) => {
        
        let el;
        
        el = document.getElementById(id);
        
        el.parentNode.removeChild(el);
    };
    
    return {
        domStrings,
        getInput,
        displayItem,
        clearFields,
        displayBudget,
        displayPercentages,
        changedType,
        displayMonth,
        deleteDisplayItem
    };
})();

const controller = ((budgetCtr, uiCtr) => {
    
    const setupEventListeners = () => {
        
        const dom = uiCtr.domStrings;
        
        document.querySelector(dom.addButton).addEventListener('click', controllerAddItem);
        
        document.addEventListener('keypress', (e) => {
            if (e.keyCode === 13 || e.which === 13){
                console.log('Enter was clicked')
                controllerAddItem();
            }
        });
        
        document.querySelector(dom.inputType).addEventListener('change', uiCtr.changedType);
        
        document.querySelector(dom.containerDelete).addEventListener('click', controllerDeleteItem);
    }
    
    const updateBudget = () => {
        
        //calculate budget
        budgetCtr.calculateBudget();
       
        //display budget
        uiCtr.displayBudget(budgetCtr.getBudget());
    };
    
    const updatePercentages = () => {
        
        let percentages;
        //calculate percentage
        budgetCtr.calculatePercentages();
        percentages = budgetCtr.getPercentages();
        
        //display percentage
        uiCtr.displayPercentages(percentages);
    };
    
    const controllerAddItem = () => {
        
        let input, newItem;   
        //1. input data
        input = uiCtr.getInput();
            
        //2. add item to budgetController
        newItem = budgetCtr.addItem(input);
            
        //3. add item to uiController
        if (newItem !== undefined) {
            uiCtr.displayItem(newItem, input.type);    
        }
    
        //4. clear the fields
        uiCtr.clearFields();
     
        //5. update budget
        updateBudget();
        
        //6. update percentage
        updatePercentages(); 
    };
    
    const controllerDeleteItem = (e) => {
        
        let id, newId, type, ID;
        
        id = e.target.parentNode.parentNode.parentNode.parentNode.id;
        newId = id.split('-');
        type = newId[0];
        ID = newId[1];
        
        if(id) {
            
            //1. delete item
            budgetCtr.deleteItem(type, parseInt(ID));
        
            //3. deleteDisplayItem
            uiCtr.deleteDisplayItem(id);
        
            //2. update budget and percentages
            updateBudget();
            updatePercentages();
        }
       
    }
     
    return {
        init: () => {
            setupEventListeners();
            uiCtr.displayBudget({
                exp: 0,
                inc: 0,
                budget: 0,
                percentages: -1
            });
            uiCtr.displayMonth();
        }         
    };
})(budgetController, uiController);


controller.init();