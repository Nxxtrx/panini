document.addEventListener("DOMContentLoaded", function () {
  // логика выпадающих списков
  const dropdown = document.querySelectorAll(".dropdown");

  const cart = [
    { id: 1, count: 3, name: "Прибор 1", price: 100 },
    { id: 2, count: 1, name: "Прибор 2", price: 100 },
    { id: 3, count: 1, name: "Прибор 3", price: 300 },
  ]
  let isDelivery = true;
  let deliveryPrice = 0;
  let deliveryFreePrice = null;
  let minPrice = 600; // Минимальная сумма заказа
  let promoCodePrice = 0;
  let locationAddressQuery = null;
  let containsArea;
  const btnSubmit = document.querySelector('.placing__button');
  const modalSuccess = document.querySelector('.modal-status_type_success');
  const modalError = document.querySelector('.modal-status_type_error');
  const placingContainer = document.querySelector('.placing__conteiner');

  generateTimeOptions();

  dropdown.forEach((item) => {
    const dropdownHeader = item.querySelector(".dropdown-header");
    const dropdownItems = item.querySelectorAll(".dropdown-item");
    const dropdownSelected = item.querySelector(".dropdown-text");

    // открытие
    dropdownHeader.addEventListener("click", () => {
      item.classList.toggle("open");
    });

    // установка значения по умолчанию
    function setDefaultSelection() {
      if (dropdownItems.length > 0) {
        const firstItem = dropdownItems[0];
        dropdownSelected.textContent = firstItem.textContent; // Устанавливаем текст
        item.setAttribute("data-value", firstItem.dataset.value); // Устанавливаем ID
      }
    }

    setDefaultSelection();

    // обработка кликов
    dropdownItems.forEach((element) => {
      element.addEventListener("click", () => {
        dropdownSelected.textContent = element.textContent;
        item.setAttribute("data-value", element.dataset.value);
        dropdownItems.forEach((item) => {
          item.classList.remove("active");
        });
        element.classList.add("active");
        item.classList.remove("open");
      });
    });

    // закрытие по клику вне
    document.addEventListener("click", (e) => {
      if (!item.contains(e.target)) {
        item.classList.remove("open");
      }
    });
  });

  // запрет ввода символов
  const numberInputs = document.querySelectorAll(".placing__input_type_number");

  numberInputs.forEach((input) => {
    input.addEventListener("input", function (e) {
      e.target.value = e.target.value.replace(/[^0-9]/g, "");
    });
  });


  // маска телефона
  let phoneInput = document.getElementById("phone");

  phoneInput.addEventListener("input", function (e) {
    let value = e.target.value.replace(/\D/g, "");
    if (value.startsWith("7")) value = value.substring(1);

    if (value.length > 0 && value[0] !== "9") {
      value = "9" + value;
  }

    let formattedValue = "+7 ";

    if (value.length > 0) formattedValue += `(${value.substring(0, 3)}`;
    if (value.length >= 4) formattedValue += `)-${value.substring(3, 6)}`;
    if (value.length >= 7) formattedValue += `-${value.substring(6, 8)}`;
    if (value.length >= 9) formattedValue += `-${value.substring(8, 10)}`;

    e.target.value = formattedValue;
  });

  const placingForm = document.getElementById("placingForm");

  // отправка формы
  placingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    // Создаем объект FormData из формы
    const formData = new FormData(this);

    // Преобразуем FormData в объект
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    let isValid = true;
    // валидация для имени
    const name = document.getElementById("name");
    const nameError = document.getElementById("nameError");
    if (name.value === "") {
      nameError.classList.add("active");
      name.classList.add("placing__input_type_error");
      nameError.innerHTML = `<p class="error" data-value="name">Не заполнено поле. Введите ваше имя</p>`;
      isValid = false;
    }

    // валидация для телефона
    const phone = document.getElementById("phone");
    const phoneError = document.getElementById("phoneError");
    if (phone.value === "" || phone.value.length < 18) {
      phoneError.classList.add("active");
      phone.classList.add("placing__input_type_error");
      phoneError.innerHTML = `<p class="error" data-value="phone">Не заполнено поле. Введите номер телефона</p>`;
      isValid = false;
    }

    if (formObject.deliveryType && formObject.deliveryType === "delivery") {
      // валидация для адреса
      const address = document.getElementById("address");
      const entrance = document.getElementById("entrance");
      const apartment = document.getElementById("apartment");
      const addressError = document.getElementById("addressError");
      addressError.innerHTML = "";
      if (address.value === "" || !address.value.match(/г\.?\s*(\S+),\s*ул\.?\s*(\S+),\s*д\.?\s*(\d+)/i)) {
        addressError.classList.add("active");
        const errorItem = document.createElement("p");
        errorItem.classList.add("error");
        errorItem.textContent = `Не заполнено или некорректно заполнено поле. Введите адрес`;
        errorItem.dataset.value = "address";
        addressError.appendChild(errorItem);
        address.classList.add("placing__input_type_error");
        isValid = false;
      }

      if (entrance.value === "") {
        addressError.classList.add("active");
        const errorItem = document.createElement("p");
        errorItem.classList.add("error");
        errorItem.textContent = `Не заполнено поле. Введите номер подъезда`;
        errorItem.dataset.value = "entrance";
        addressError.appendChild(errorItem);
        entrance.classList.add("placing__input_type_error");
        isValid = false;
      }

      if (apartment.value === "") {
        addressError.classList.add("active");
        const errorItem = document.createElement("p");
        errorItem.classList.add("error");
        errorItem.textContent = `Не заполнено поле. Введите номер квартиры`;
        errorItem.dataset.value = "apartment";
        addressError.appendChild(errorItem);
        apartment.classList.add("placing__input_type_error");
        isValid = false;
      }
    }

    // const deliveryZone = document.getElementById("zone");
    const deliveryDate = document.getElementById("deliveryDate");
    const devicesCount = document.getElementById("devicesCount");

    // formObject.zone = deliveryZone.dataset.value;
    formObject.deliveryDate = deliveryDate.dataset.value;
    formObject.devicesCount = devicesCount.dataset.value;

    if (isValid) {
      placingContainer.style.display = "none";
      // modalSuccess.classList.add("open");
      modalError.classList.add("open");
    }
  });

  // кнопка связаться с менеджером при успешном заказе в модальном окне
  const modalSuccessButton = modalSuccess.querySelector(".modal-status__button");
  modalSuccessButton.addEventListener("click", () => {
    modalSuccess.classList.remove("open");
    placingContainer.style.display = "block";
  });

  // кнопка для возврата к оформлению при ошибке оплаты
  const modalErrorButton = modalError.querySelector(".modal-status__button");
  modalErrorButton.addEventListener("click", () => {
    modalError.classList.remove("open");
    placingContainer.style.display = "block";
  });

  // заполнение часов доставки
  function generateTimeOptions() {
    const currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 90); // Добавляем 1.5 часа

    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    const dropdownList = document.querySelector("#deliveryDate .dropdown-list");

    // Очищаем список перед добавлением новых элементов
    dropdownList.innerHTML = "";

    const asapItem = document.createElement("li");
    asapItem.classList.add("dropdown-item");
    asapItem.dataset.value = "asap";
    asapItem.textContent = "Как можно скорее";
    dropdownList.appendChild(asapItem);

    let nextAvailableHour = currentHours < 11 ? 11 : currentHours;
    let nextAvailableMinute = currentMinutes < 30 ? 30 : 0;

    if (currentMinutes >= 30) {
      nextAvailableHour += 1; // Переход на следующий час
      nextAvailableMinute = 0;
    }

    // Генерируем список времени (через каждые 30 минут) до 23:30
    while (nextAvailableHour < 22 ||(nextAvailableHour === 22 && nextAvailableMinute <= 30)) {
      // Создаем новый элемент списка
      const listItem = document.createElement("li");
      listItem.classList.add("dropdown-item");
      listItem.dataset.value = `${nextAvailableHour}:${nextAvailableMinute}`;
      listItem.textContent = `к ${nextAvailableHour}:${nextAvailableMinute < 10 ? "0" : ""}${nextAvailableMinute}`;

      // Добавляем элемент в список
      dropdownList.appendChild(listItem);

      // Переходим к следующему интервалу (через 30 минут)
      nextAvailableMinute = nextAvailableMinute === 30 ? 0 : 30;
      if (nextAvailableMinute === 0) nextAvailableHour++;

      // Останавливаем генерацию, если достигли 23:30
      if (nextAvailableHour === 23 && nextAvailableMinute === 30) break;
    }
  }

  const inputsList = document.querySelectorAll(".placing__input");

  function removeError(inputElement) {
    const errorItem = document.querySelector(
      `.error[data-value="${inputElement.id}"]`
    );
    if (errorItem) {
      errorItem.remove(); // Удаление ошибки
    }
    inputElement.classList.remove("placing__input_type_error"); // Удаление класса ошибки
  }

  inputsList.forEach((input) => {
    input.addEventListener("input", () => {
      if (input.id) removeError(input);
    });
  });

  let maps;
  let placemark;
  let polygons = {}; // Объект для хранения всех полигонов

  // подключение карты
  ymaps.ready(function () {
    const map = document.querySelector("#map");

    if (!map) return;

    maps = new ymaps.Map(
      "map",
      {
        center: [54.723398, 55.985267],
        zoom: 12,
        controls: [],
      },
      { suppressMapOpenBlock: true }
    );

    var centerPolygon = new ymaps.Polygon(
      [
        [
          [54.731611, 55.956266],
          [54.734776, 55.957960],
          [54.736226, 55.948621],
          [54.737768, 55.940022],
          [54.723854, 55.933252],
          [54.720997, 55.950418],
          [54.723573, 55.951733],
          [54.724481, 55.952632],
          [54.725146, 55.953285],
          [54.727821, 55.954578],
          [54.731611, 55.956266],
        ],
      ],
      {
        hintContent: "Центр",
      },
      {
        fillColor: "#94E0DA80",
        strokeColor: "#000000",
        strokeWidth: 2,
      }
    );

    var zelenkaPolygon = new ymaps.Polygon([
      [
        [54.724512, 55.914486],
        [54.736433, 55.918091],
        [54.736582, 55.925988],
        [54.740505, 55.928133],
        [54.739711, 55.937146],
        [54.745868, 55.941780],
        [54.739065, 55.973452],
        [54.738767, 55.982207],
        [54.726697, 55.976628],
        [54.720338, 55.978001],
        [54.717456, 55.963324],
        [54.714475, 55.958861],
        [54.703790, 55.967615],
        [54.698819, 55.970019],
        [54.692108, 55.967530],
        [54.689075, 55.967015],
        [54.688080, 55.972508],
        [54.684052, 55.974053],
        [54.680919, 55.973452],
        [54.679079, 55.976456],
        [54.686141, 55.987614],
        [54.693947, 55.990017],
        [54.697875, 55.993794],
        [54.709257, 56.000145],
        [54.717506, 56.004265],
        [54.726747, 56.020315],
        [54.738916, 56.028126],
        [54.744329, 56.029671],
        [54.753464, 56.011904],
        [54.758875, 55.996712],
        [54.755549, 55.968388],
        [54.747159, 55.942810],
        [54.745322, 55.922640],
        [54.747606, 55.907963],
        [54.744875, 55.899723],
        [54.736532, 55.897578],
        [54.729162, 55.897402],
        [54.724512, 55.914486]
      ],
    ], {
      hintContent: "Зеленка",
    }, {
      fillColor: "#FFD70080",
      strokeColor: "#000000",
      strokeWidth: 2,
    });
  
    var sipailovoPolygon = new ymaps.Polygon([
          [
            [54.718338897564415, 55.94957000667241],
            [54.714500397352, 55.95881826335572],
            [54.71745694438134, 55.96323854381227],
            [54.72035116929256, 55.977979964558116],
            [54.72675995865006, 55.9766281312146],
            [54.738717825833895, 55.982164210621406],
            [54.739053042056966, 55.97334510738041],
            [54.74585608757949, 55.941673583332566],
            [54.73969863581161, 55.93712455684333],
            [54.74039387906619, 55.92828399593023],
            [54.736520228291354, 55.92588073665288],
            [54.73637123429268, 55.918070144001504],
            [54.72444993098196, 55.914379424397005],
            [54.7213883195279, 55.93064433986327],
            [54.718338897564415, 55.94957000667241]
          ],
          [
            [54.723882459061755, 55.933234816144015],
            [54.73778664859058, 55.940033236533765],
            [54.736197284710094, 55.948916646304305],
            [54.734818942093234, 55.95781078491095],
            [54.73295639900285, 55.956931020354105],
            [54.73183883185744, 55.95637312087901],
            [54.73000098745154, 55.955547000502435],
            [54.72782562710257, 55.95455301339425],
            [54.72708049101588, 55.954209690640354],
            [54.72523622003041, 55.95334065491962],
            [54.724907098833775, 55.95300806100178],
            [54.72386382899693, 55.951978092740056],
            [54.72355177428629, 55.95170987183853],
            [54.72311240960644, 55.95148456628132],
            [54.7210009083235, 55.950427775929406],
            [54.723882459061755, 55.933234816144015]
          ]
    ], {
      hintContent: "Сипайлово",
    }, {
      fillColor: "#DDA0DD80",
      strokeColor: "#000000",
      strokeWidth: 2,
    });
  
    maps.geoObjects.add(centerPolygon);
    maps.geoObjects.add(zelenkaPolygon);
    maps.geoObjects.add(sipailovoPolygon);

    polygons["center"] = centerPolygon;
    polygons["zelenka"] = zelenkaPolygon;
    polygons["sipailovo"] = sipailovoPolygon;
  });

  // установка маркера на карте
  function setMapMarker(lat, lon, address) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const map = document.querySelector('.map')
    containsArea = null;
  
    if (!isNaN(latitude) && !isNaN(longitude)) {
      maps.setCenter([latitude, longitude], 16);
  
      if (placemark) {
        maps.geoObjects.remove(placemark);
      }
  
      placemark = new ymaps.Placemark([latitude, longitude], {
        balloonContent: address,
      });
  
      maps.geoObjects.add(placemark);

      for (let region in polygons) {
        const containsPoint = polygons[region].geometry.contains([latitude, longitude]);

        if (containsPoint) {
          containsArea = region;
        }
      }

      addLocationError(containsArea);

      updateTotalPrice();
    }
  }

  // функция для добавления ошибки локации
  function addLocationError(containsArea, reset = false,) {
    const container = document.querySelector(".delivery-address");
    const leftSideContainer = document.querySelector(".placing__left");
    const leftSideError = leftSideContainer.querySelector(".alert[data-value='location-error']");

    if(reset) {
      btnSubmit.disabled = false;
      const locationError = document.querySelector('div[data-value="location-error"]');
      if (locationError) {
        locationError.remove();
        if (leftSideError) {
          leftSideError.remove();
        }
      }
      return
    }

    if (!containsArea) {
      if(!leftSideError) {
        showAlert("Доставка по этому адресу недоступна", "error", container, 'location-error');
        btnSubmit.disabled = true;
        showAreaPrice();
        checkValidate();
      }
    } else {
      btnSubmit.disabled = false;
      const locationError = document.querySelector('div[data-value="location-error"]');
      if (locationError) {
        locationError.remove();
        if (leftSideError) {
          leftSideError.remove();
        }
      }
      showAreaPrice(containsArea);
      checkValidate();
    }
  }

  // показать цены в зависимости от района
  function showAreaPrice(area) {

    const mapLegend = document.querySelector('.map__legend');
    const legendItem = mapLegend.querySelectorAll(`.map__legend-item`);

    if(!area) {
      legendItem.forEach((item) => {
        item.style.display = 'flex';
      })
    } else {
      legendItem.forEach((item) => {
        if (item.dataset.value !== area) {
          item.style.display = 'none';
        } else {
          item.style.display = 'flex';
          deliveryPrice = item.dataset.price;
          deliveryFreePrice = item.dataset.free;
          updateDeliveryPrice('delivery');
        }
      })
    }
  }

  // если указан самовывоз
  const deliveryTypeRadios = document.querySelectorAll('input[name="deliveryType"]');
  const deliveryAddress = document.querySelector(".delivery-address");
  const map = document.querySelector(".map");
  // const deliveryZone = document.querySelector(".delivery-zone");
  const deliveryTime = document.querySelector(".delivery-time").querySelector(".placing__label");
  deliveryTypeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.value === "pickup") {
        isDelivery = false;
        deliveryAddress.style.display = "none";
        map.style.display = "none";
        // deliveryZone.style.display = "none";
        deliveryTime.textContent = "Самовывоз ко времени";
        addLocationError(null, true);
        checkValidate();
        updateTotalPrice();
      } else {
        isDelivery = true;
        deliveryAddress.style.display = "flex";
        map.style.display = "block";
        // deliveryZone.style.display = "block";
        deliveryTime.textContent = "Доставка ко времени";
        if(locationAddressQuery) {
          addLocationError(containsArea);
        }
        checkValidate();
        updateTotalPrice();
        maps.container.fitToViewport();
      }
    });
  });



  // обновление общей суммы
  function updateTotalPrice() {
    const totalPrice = document.querySelector(".placing__checklist-total");
    const discountContainer = document.querySelector(".placing__checklist-container_type_discount");
    const promoCodeElement = document.getElementById("promocodePrice");
    const discount = document.getElementById("discount");
    const leftSideContainer = document.querySelector(".placing__left");
  
    let totalCart = cart.reduce((acc, item) => acc + item.price * item.count, 0);
    let totalSum = totalCart;
    let discountSum = 0;
    let promoSum = 0;

    // применение промокода
    if(promoCodePrice) {
      if(promoCodePrice.type === 'percent') {
        promoSum = totalCart * (promoCodePrice.discount / 100);
        promoCodeElement.textContent = `${promoCodePrice.discount} %`;
      } else if(promoCodePrice.type === 'fixed') {
        promoSum = promoCodePrice.discount;
        promoCodeElement.textContent = `${promoCodePrice.discount} ₽`;
      } else {
        promoCodeElement.textContent = `${promoCodePrice.discount}  ₽`;
      }

      totalSum -= promoSum;
    } else {
      promoCodeElement.textContent = "0 ₽";
    }
  
    // применение скидки на доставку
    if (!isDelivery) {
      discountSum = totalCart * 0.2; // Скидка 20%
      discount.textContent = `-${discountSum} ₽`;
      totalSum -= discountSum;
      discountContainer.style.display = "flex";
      updateDeliveryPrice('pickup');
    } else {
      discountSum = 0;
      discount.textContent = "0 ₽";
      discountContainer.style.display = "none";
      updateDeliveryPrice('delivery');
      if(deliveryFreePrice && totalSum < deliveryFreePrice) {
        totalSum += parseInt(deliveryPrice);
      }
    }
    
    totalPrice.textContent = `Сумма: ${totalSum} ₽`;

    if((totalCart - discountSum - promoSum) < minPrice) {
      btnSubmit.disabled = true;
      showAlert(`Минимальная стоимость блюд в заказе, с учетом скидок, должна быть не менее ${minPrice} ₽. Добавьте в корзину товаров еще на ${minPrice - (totalCart - promoSum - discountSum)} ₽.`, "error", leftSideContainer, 'total-error', false);
    } else {
      deleteAlertToLeftSide('total-error');
      checkValidate();
    }
  }


  // заполнение данных заказа
  const count = document.getElementById("count");
  const price = document.getElementById("price");
  const delivery = document.getElementById("deliveryPrice");
  const countTotal = cart.reduce((acc, item) => acc + item.count, 0)
  const priceSum = cart.reduce((acc, item) => acc + item.price * item.count, 0);

  count.textContent = `${countTotal} ${plural(countTotal, { one: "товар", few: "товара", many: "товаров" })}`;
  price.textContent = `${priceSum} ₽`;

  function updateDeliveryPrice(type) {
    if(type === 'delivery') {
      if(deliveryFreePrice && priceSum > deliveryFreePrice) {
        delivery.textContent = `Бесплатно`;
      } else {
        delivery.textContent = `${deliveryPrice === 0  ? "Бесплатно" : `${deliveryPrice} ₽`}`;
      }
    } else {
      delivery.textContent = `Бесплатно`;
    }
  }

  updateTotalPrice();

  // интеграция dadata
  var url = "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address";
  var token = "f86689b0d9339eda4ee961415b03555a9a09f67f";
  const addressQuery = document.getElementById("address");
  const addressSuggestions = document.querySelector(".delivery-address__dropdown-list");

  addressQuery.addEventListener("input", () => {
    locationAddressQuery = addressQuery.value;
    const query = addressQuery.value;
    if(!query || query.length < 3) {
      addressSuggestions.innerHTML = "";
      addressSuggestions.style.display = "none";
    };
    if(query.length < 3) return;

    const closeButton = document.querySelector(".delivery-address__dropdown-clear"); 

    document.addEventListener("click", (e) => {
      if (!addressSuggestions.contains(e.target)) {
        addressSuggestions.style.display = "none";
        closeButton.style.display = "none";
      }
    });

    var options = {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Token " + token,
      },
      body: JSON.stringify({
        query: query, 
        locations: [{city_fias_id: "7339e834-2cb4-4734-a4c7-1fca2c66e562"}],
        from_bound: { value: "street" },
        to_bound: { value: "house" },
      }),
    };

    fetch(url, options)
      .then((response) => response.text())
      .then((result) => {
        result = JSON.parse(result);
        addressSuggestions.innerHTML = "";
        if(result.suggestions.length !== 0) {
          result.suggestions.forEach((item) => {
            if(item.data.qc_geo > 2) return;
            const addressItem = document.createElement("li");
            addressItem.classList.add("dropdown-item");
            addressItem.textContent = item.value;
            addressItem.addEventListener("click", () => {
              addressQuery.value = item.value;
              addressSuggestions.innerHTML = "";
              addressSuggestions.style.display = "none";
              setMapMarker(item.data.geo_lat, item.data.geo_lon, item.value);
            });
            addressSuggestions.appendChild(addressItem);
            addressSuggestions.style.display = "block";
            closeButton.style.display = "block";
            closeButton.addEventListener("click", () => {
              addressSuggestions.style.display = "none";
              closeButton.style.display = "none";
            })
          });
        } else {
          addressSuggestions.style.display = "none";
          closeButton.style.display = "none";
        }
      })
      .catch((error) => console.log("error", error));
  });

  // Проверка промокода 
  const discountContainer = document.querySelector(".promocode");
  const discountCode = document.getElementById("promocode");
  const promoCodeError = document.getElementById("promocodeError");
  discountCode.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      checkPromoCode(discountCode.value.trim());
    }
  });
  
  discountCode.addEventListener("input", () => {
    const alert = discountContainer.querySelector(".alert");
    if (alert) {
      alert.remove();
      const leftSideContainerAlert = document.querySelector(`.alert[data-value="${alert.dataset.value}"]`);
      if(leftSideContainerAlert) leftSideContainerAlert.remove();
    }
  });
  
  // Функция проверки промокода
  function checkPromoCode(code) {
    if (!code) {
      return;
    }
  
    const validPromoCodes = [
      {
        code: "NEW",
        discount: 10,
        type: "percent",
      }, {
        code: "new2",
        discount: 20,
        type: "fixed",
      }
    ]; // Пример списка
    const oldPromoCodes = [{
      code: "OLD",
      discount: 30,
    }];

    const promo = validPromoCodes.find(promo => promo.code.toUpperCase() === code.toUpperCase());
    const oldPromo = oldPromoCodes.find(promo => promo.code.toUpperCase() === code.toUpperCase());
  
    if (promo) {
      showAlert("Промокод применен!", "success", discountContainer, 'promo-error');
      promoCodePrice = promo;
      updateTotalPrice();
    } else if (oldPromo) {
      showAlert("Промокод устарел. Воспользуйтесь новым!", "error", discountContainer, 'promo-success');
      promoCodePrice = null;
      updateTotalPrice();
    } else {
      promoCodePrice = null;
      updateTotalPrice();
      promoCodeError.classList.add("active");
      discountCode.classList.add("placing__input_type_error");
      promoCodeError.innerHTML = `<p class="error" data-value="promocode">Неверный промокод. Введите заново</p>`;
    }
  }

  // Функция вставки алерта
  function showAlert(message, type, parentElement, value, twoPlace = true) {
    if(!parentElement) return

    const existingAlert = parentElement.querySelector(".alert");
    if (existingAlert) {
      existingAlert.remove();
    }

    const alertDiv = document.createElement("div");
    alertDiv.classList.add("alert", `alert_type_${type}`);
    alertDiv.dataset.value = value;
    alertDiv.innerHTML = `
      <svg class="alert__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 
          12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 
          15H13V17H11V15ZM11 7H13V13H11V7Z" fill="#D9BD75"
          />
        </svg>
        <p class="alert__text">${message}</p>
      `;
    
    parentElement.appendChild(alertDiv);
    if(twoPlace) {
      const alertClone = alertDiv.cloneNode(true);
      addAlertToLeftSide(alertClone);
    }
  }

  // Добавление алертов под подтверждением заказа
  function addAlertToLeftSide(alert) {
    const leftSideContainer = document.querySelector(".placing__left");
    if(!alert) return 
    leftSideContainer.appendChild(alert);
  }

  function deleteAlertToLeftSide(alert) {
    const leftSideContainer = document.querySelector(".placing__left");
    const errorAlert = leftSideContainer.querySelector(`.alert[data-value="${alert}"]`);
    if(!errorAlert) return
    errorAlert.remove();
    
  }

  function checkValidate() {
    const locationError = document.querySelector(".alert[data-value='location-error']");
    const consentCheckbox = document.querySelector(".placing__checkbox input"); 
    const totalError = document.querySelector(".alert[data-value='total-error']");

    if (consentCheckbox.checked && !locationError && !totalError) {
      btnSubmit.disabled = false;
    } else {
      btnSubmit.disabled = true;
    }
  }

  // обработка персональных данных 
  const consentCheckbox = document.querySelector(".placing__checkbox input");
  consentCheckbox.addEventListener("change", () => {
    checkValidate();
  });

  // Плюрализация
  function plural(value, variants = {}, locale = 'ru-RU') {
    const key = new Intl.PluralRules(locale).select(value);
    // Возвращаем вариант по ключу, если он есть
    return variants[key] || variants['one'];
  }
});