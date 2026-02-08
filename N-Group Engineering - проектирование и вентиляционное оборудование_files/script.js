$(document).ready(function () {
  var owl = $('#img-carousel');

  owl.owlCarousel({
    items: 4,
    loop: true,
    margin: 10,
    nav: false,
    dots: true,
    autoplay: true,
    autoplayTimeout: 3000,
    autoplayHoverPause: true,
    responsive: {
      0: { items: 2 },
      600: { items: 2 },
      1000: { items: 4 }
    }
  });

  // Кастомные стрелки
  var navWrapper = $('.owl-custom-nav[data-target="#img-carousel"]');
  navWrapper.find('.btn-next').click(function () {
    owl.trigger('next.owl.carousel');
  });
  navWrapper.find('.btn-prev').click(function () {
    owl.trigger('prev.owl.carousel');
  });

  // Клик по изображению
  $('#img-carousel').on('click', 'img', function () {
    const newSrc = $(this).attr('src');
    $('#main-product-image').attr('src', newSrc);
    console.log('✅ Image clicked, new src:', newSrc);
  });
});


$(document).ready(function () {
  $('#project-carousel').owlCarousel({
    items: 4,
    margin: 15,
    loop: true,
    autoplay: true,
    autoplayTimeout: 2000,
    smartSpeed: 800,
    autoplayHoverPause: true,
    dots: true, // ✅ Включаем индикаторы
    nav: false,
    responsive: {
      0: { items: 2 },
      600: { items: 2 },
      1000: { items: 4 }
    },
    onInitialized: addDotsWrapper
  });

  function addDotsWrapper(event) {
    // Оборачиваем dots в кастомный контейнер (если нужно)
    const $dots = $('#project-carousel .owl-dots');
    if ($dots.length && !$dots.parent().hasClass('owl-dots-wrapper')) {
      $dots.wrap('<div class="owl-dots-wrapper text-center mt-3"></div>');
    }
  }
});





// главная стрелки расскрывают содержимое
document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll('.olimp-card');

  cards.forEach(card => {
    const hidden = card.querySelector('.hidden-col');

    card.addEventListener('mouseenter', () => {
      hidden.style.height = hidden.scrollHeight + "px";
    });

    card.addEventListener('mouseleave', () => {
      hidden.style.height = "0";
    });
  });
});

///TOP menu dropdowns
document.addEventListener("DOMContentLoaded", function () {
  const triggers = document.querySelectorAll("img[data-target]");
  const dropdowns = document.querySelectorAll(".top-dropdown");

  let activeDropdown = null;

  // Открытие/закрытие по клику на иконку
  triggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.stopPropagation(); // не передаём клик выше

      const targetClass = trigger.dataset.target;
      const dropdown = document.querySelector(".top-dropdown." + targetClass);

      if (!dropdown) return;

      // Если клик по той же иконке → скрываем меню
      if (activeDropdown === dropdown) {
        dropdown.style.display = "none";
        dropdown.classList.remove("slide-in-top");
        activeDropdown = null;
        return;
      }

      // Закрываем все
      dropdowns.forEach(d => {
        d.style.display = "none";
        d.classList.remove("slide-in-top");
      });

      // Показываем нужное
      dropdown.style.display = "block";
      void dropdown.offsetWidth;
      dropdown.classList.add("slide-in-top");
      activeDropdown = dropdown;
    });
  });

  // Закрытие по крестикам
  document.querySelectorAll(".top-dropdown .close-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parentDropdown = btn.closest(".top-dropdown");
      if (parentDropdown) {
        parentDropdown.style.display = "none";
        parentDropdown.classList.remove("slide-in-top");
        activeDropdown = null;
      }
    });
  });

  // Закрытие по клику вне меню
  document.addEventListener("click", function (e) {
    if (activeDropdown && !activeDropdown.contains(e.target)) {
      activeDropdown.style.display = "none";
      activeDropdown.classList.remove("slide-in-top");
      activeDropdown = null;
    }
  });
});



// ОТПРАВКА ПИСЕМ
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault(); // Предотвращаем стандартное поведение формы

            console.log("Форма отправлена, начинаем обработку...");

            let submitButton = form.querySelector(".order");
            let formContainer = form.closest(".form-div");

            // Проверяем, найден ли контейнер формы
            if (!formContainer) {
                console.error("Ошибка: контейнер формы (.form-div) не найден!");
                return;
            }

            // Создаем прелоадер
            let preloader = document.createElement("img");
            preloader.src = "/image/sistem/preloader.gif";
            preloader.classList.add("w-100");

            if (submitButton) submitButton.classList.add("disabled"); // Деактивируем кнопку
            form.style.display = "none"; // Скрываем форму
            formContainer.innerHTML = ""; // Очищаем контейнер
            formContainer.appendChild(preloader); // Вставляем прелоадер

            console.log("Форма скрыта, прелоадер показан.");

            // Создаем объект FormData
            let formData = new FormData(form);
			if (window._formToken) {
    formData.append('form_token', window._formToken);
}

            console.log("Данные формы:", Object.fromEntries(formData));

            // Отправляем AJAX-запрос
            fetch("/assets/tools/mail.php", {
                method: "POST",
                body: formData
            })
                .then(response => response.text())
                .then(responseText => {
                    console.log("Ответ от сервера получен:", responseText);

                    // Проверяем существование контейнера
                    if (!formContainer) {
                        console.error("Ошибка: formContainer отсутствует после запроса!");
                        return;
                    }

                    // Убираем прелоадер и вставляем ответ от сервера
                    formContainer.innerHTML = "";
                    let emailMsg = document.createElement("div");
                    emailMsg.classList.add("emailMsg", "emailMsg1");
                    emailMsg.innerHTML = responseText;
                    formContainer.appendChild(emailMsg);

                    console.log("Ответ от сервера вставлен в emailMsg.");

                    // Разбиваем ответ, если нужно
                    let result = responseText.split("|***|");
                    if (result[1] == "1") {
                        emailMsg.innerHTML = result[0];
                        form.querySelectorAll("input[type=text], input[type=tel]").forEach(input => {
                            input.value = "";
                        });
                        console.log("Форма успешно отправлена, поля очищены.");
                    } else {
                        emailMsg.innerHTML = result[0];
                        console.log("Ошибка при отправке формы.");
                    }

                    // Через 10 секунд убираем сообщение и возвращаем форму
                    setTimeout(() => {
                        formContainer.innerHTML = ""; // Очищаем контейнер
                        formContainer.appendChild(form); // Возвращаем форму
                        form.style.display = "block"; // Показываем форму обратно
                        if (submitButton) submitButton.classList.remove("disabled"); // Активируем кнопку
                        console.log("Форма восстановлена.");
                    }, 10000);
                })
                .catch(error => {
                    console.error("Ошибка при отправке формы:", error);
                    if (formContainer) {
                        formContainer.innerHTML = "Произошла ошибка. Попробуйте снова.";
                    }
                    if (submitButton) submitButton.classList.remove("disabled");
                });
        });
    });
});

//Фильтр
$(document).ready(function() {
  function handleCheckboxChange() {
    // Проверяем, есть ли выбранные чекбоксы
    var anyCheckboxChecked = $(".attribute input[type='checkbox']:checked").length > 0;

    // Скрыть или показать кнопку "Очистить" в зависимости от наличия выбранных чекбоксов
    if (anyCheckboxChecked) {
      $("#clearButton").show(); // Показать кнопку "Очистить", если есть выбранные чекбоксы
      $("#products").hide(); // Скрыть старые данные
    } else {
      $("#clearButton").hide(); // Скрыть кнопку "Очистить", если нет выбранных чекбоксов
      $("#products").show(); // Показать старые данные, если фильтры не применены
    }

    // Далее ваш код обработки изменений чекбоксов
    $("#response").empty();
    var selectedValues = [];
    var category_id = $(".attribute input[type='checkbox']:checked").first().data('category'); // Получаем значение category_id из атрибута data-category первого выбранного чекбокса

    // Перебираем все выбранные чекбоксы и добавляем их значения в массив selectedValues
    $(".attribute input[type='checkbox']:checked").each(function() {
      selectedValues.push($(this).val());
    });

    // Добавляем прелоадер к ответу
    $("#response").append('<img src="image/preloader.gif">');

    // Вывод данных для отладки
    console.log("Selected Values:", selectedValues);
    console.log("Category ID:", category_id);

    // Отправляем AJAX-запрос на сервер
    $.ajax({
      url: "/assets/tools/filter.php",
      method: "POST",
      data: {
        selectedValues: selectedValues,
        category_id: category_id // Передаем category_id вместе с выбранными значениями
      },
      success: function(response) {
        // Обработать ответ сервера
        $("#response").html(response);
      }
    });
  }

  // Вызываем функцию для проверки состояния чекбоксов при загрузке страницы
  handleCheckboxChange();

  // Обработчик изменений в чекбоксах
  $(".attribute input[type='checkbox']").change(handleCheckboxChange);

  // Обработчик нажатия на кнопку "Очистить"
  $("#clearButton").click(function() {
    // Сбрасываем все чекбоксы в блоке с классом .attribute
    $(".attribute input[type='checkbox']").prop('checked', false);
    // Запускаем функцию для обработки изменений
    handleCheckboxChange();
    $("#response").empty(); // Очистить результаты фильтра
    $("#products").show(); // Показать старые данные
  });
});