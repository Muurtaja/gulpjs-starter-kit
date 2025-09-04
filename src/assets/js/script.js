"use strict";
(function ($) {
    const themeConfig = {

        headerSticky() {
            const btn = $(".scroll-top");
            $(window).on("scroll", function () {
                if ($(window).scrollTop() >= 300) {
                    $(".header").addClass("header-sticky");
                } else {
                    $(".header").removeClass("header-sticky");
                }
            });

            btn.on("click", function (e) {
                e.preventDefault();
                $("html, body").animate({ scrollTop: 0 }, "300");
            });
        },

        backgroundImage() {
            $("[data-bg-img]").css("background-image", function () {
                return `url(${$(this).data("bg-img")})`;
            });
        },
        togglePassword() {
            $(".toggle-password-show").on("click", function () {
                $(this).toggleClass("fa-eye");
                var input = $($(this).attr("id"));
                if (input.attr("type") == "password") {
                    input.attr("type", "text");
                } else {
                    input.attr("type", "password");
                }
            });
        },

        scrollToTop() {
            const $btn = $('#backToTop');
            const showAt = 200;

            function toggleVisiable() {
                if ($(window).scrollTop() > showAt) {
                    $btn.addClass('is-visible');
                } else {
                    $btn.removeClass('is-visible');
                }
            }

            function toTop(e) {
                e.preventDefault();
                $('html, body').animate({ scrollTop: 0 }, 400);
            }

            $(window).on('scroll', toggleVisiable);
            $btn.on('click', toTop);

            toggleVisiable();
        },

        activeSelect2() {
            $(".select2").each((index, select) => {
                $(select)
                    .wrap('<div class="custom-select2"></div>')
                    .select2({
                        dropdownParent: $(select).closest(".custom-select2"),
                    });
            });
        },
        activeTooltip() {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            tooltipTriggerList.forEach(function (tooltipTriggerEl) {
                new bootstrap.Tooltip(tooltipTriggerEl, {
                    trigger: 'hover'  // This makes it hover-only
                });
            });
        }


    };

    themeConfig.headerSticky();
    themeConfig.backgroundImage();
    themeConfig.togglePassword();
    themeConfig.scrollToTop();
    themeConfig.activeSelect2();
    themeConfig.activeTooltip();
    /*
    * Activate preloader
    * Preloader will show if page dose not have any error.
    */
    $(window).on("load", () => $(".custom-preloader").fadeOut());
})(jQuery);