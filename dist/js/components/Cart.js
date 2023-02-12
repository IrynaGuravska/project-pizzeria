import {settings, select, templates, classNames} from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';

class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.update();

    console.log('new Cart', thisCart);
  }

  getElements(element){
    const thisCart = this;
    thisCart.dom = {};

    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;
    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };
    console.log('sendOrder', payload);

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response){
        return response.json();
      }).then(function (parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
      });
  }  
  
  add(menuProduct){
    const thisCart = this;

    /*generate HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);

    /*create element utils.createElementFromHTML*/
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    /*all element to menu*/
    thisCart.dom.productList.appendChild(generatedDOM);
    //console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }
  
  update(){
    const thisCart = this;

    thisCart.deliveryFee = 0;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }

    if (thisCart.totalNumber != 0){
      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    } else if(thisCart.totalNumber == 0){
      thisCart.totalPrice = 0;
      thisCart.dom.deliveryFee.innerHTML = 0;
    }

    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    for (let price of thisCart.dom.totalPrice){
      price.innerHTML = thisCart.totalPrice;
    }
  }

  remove(event){
    const thisCart = this;

    event.dom.wrapper.remove();

    console.log('event.dom.wrapper', event.dom.wrapper);

    const remuvedProducts = thisCart.products.indexOf(event);
    thisCart.products.splice(remuvedProducts, 1);
    thisCart.update();
  }


}
export default Cart;