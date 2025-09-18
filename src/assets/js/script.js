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
        },
        tableResponsive() {

            function hideLastColumnUntilNoOverflowWithTracking($container, $table) {
                const hiddenColumns = []; // To store info about hidden columns

                function recursiveHide() {
                    if ($container[0].scrollWidth <= $container[0].clientWidth) {
                        return;
                    }

                    let $theadRow = $table.find('thead tr');
                    let $tbodyRows = $table.find('tbody tr');

                    let $lastVisibleTh = $theadRow.find('th:not(.d-none)').last();
                    if ($lastVisibleTh.length === 0) {
                        console.log('No more <th> to hide but still overflowing');
                        return;
                    }

                    let colIndex = $lastVisibleTh.index(); // Index of the column to hide
                    let headingText = $lastVisibleTh.text().trim();

                    let hiddenDataPerRow = [];

                    $lastVisibleTh.addClass('d-none');

                    $tbodyRows.each(function () {
                        let $row = $(this);
                        let $tds = $row.find('td:not(.d-none)');
                        let $allTds = $row.find('td'); // all td including hidden

                        let $tdToHide = $allTds.eq(colIndex);
                        let valueText = $tdToHide.html().trim();

                        hiddenDataPerRow.push(valueText);
                        $tdToHide.addClass('d-none');
                    });

                    hiddenColumns.push({
                        colIndex: colIndex,
                        heading: headingText,
                        values: hiddenDataPerRow,
                    });

                    recursiveHide();
                }

                recursiveHide();

                return hiddenColumns;
            }

            $(document).ready(function () {
                document.addEventListener('resize', function () {
                    setTimeout(() => {

                        $('.custom-table-responsive:not(.table-collapse)').each(function () {

                            var $container = $(this);
                            var $table = $container.find('.table');
                            var hiddenColumnsData = hideLastColumnUntilNoOverflowWithTracking($container, $table);



                            $table.find('tbody tr').each(function (rowIndex) {
                                let $row = $(this);
                                let hiddenHtml = '';

                                [...hiddenColumnsData].reverse().forEach(col => {
                                    hiddenHtml += `
                                        <div class="table-list-item">
                                        <span class="title">${col.heading}</span>
                                        <span class="value">${col.values[rowIndex]}</span>
                                        </div>
                                    `;
                                });

                                let visibleColsCount = $table.find('thead tr th:not(.d-none)').length;

                                let $hiddenRow = $(`
                                    <tr class="hidden-data-row">
                                        <td colspan="${visibleColsCount}" class="hidden-data__content" >
                                        ${hiddenHtml}
                                        </td>
                                    </tr>
                                    `);

                                $row.after($hiddenRow);
                            })
                        })

                        console.log("very good");

                    }, 10);
                })
            });
            $(document).ready(function () {
                $('.custom-table-responsive.table-collapse').each(function () {

                    var $container = $(this);
                    var $table = $container.find('.table');
                    var hiddenColumnsData = hideLastColumnUntilNoOverflowWithTracking($container, $table);



                    $table.find('tbody tr').each(function (rowIndex) {
                        let $row = $(this);
                        let hiddenHtml = '';
                        const firstTd = $row.find('td:first');
                        const index = $(this).index();

                        if (hiddenColumnsData.length) {
                            firstTd.html(`
                                <button class="table-collapse-btn" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                                    <span class="table-collapse-btn__icon">
                                        <i class="fa fa-chevron-right"></i>
                                    </span>
                                    ${firstTd.html()}
                                </button>
                            `);
                        }
                        [...hiddenColumnsData].reverse().forEach(col => {
                            hiddenHtml += `
                            <div class="table-list-item">
                                <span class="title">${col.heading}</span>
                                <span class="value">${col.values[rowIndex]}</span>
                            </div>
                        `;
                        });

                        let visibleColsCount = $table.find('thead tr th:not(.d-none)').length;

                        let $hiddenRow = $(`
                            <tr class="hidden-data-row">
                                <td colspan="${visibleColsCount}" class="hidden-data-row__content">
                                    <div class="collapse" id="collapse${index}">${hiddenHtml}</div>/ n;rfejiosedrf. IKMJ"
                                </td>
                            </tr>
                        `);

                        $row.after($hiddenRow);
                    })
                })
            });

        },
        tableDropdown() {
            $(document).on('click', 'table .dropdown-toggle', function (e) {
                const $toggle = $(this);
                const $menu = $toggle.next();
                if ($menu.length === 0) return;


                const rect = this.getBoundingClientRect();
                const menuWidth = $menu.outerWidth();
                const menuHeight = $menu.outerHeight();
                const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

                const spaceBelow = viewportHeight - rect.bottom;
                const openUpwards = spaceBelow < menuHeight;

                $menu.css({
                    position: 'fixed',
                    inset: 'unset',
                    right: 'unset',
                    transform: 'none',
                    left: `${rect.right - menuWidth}px`,
                    top: openUpwards ? `${rect.top - menuHeight}px` : `${rect.bottom}px`,
                    zIndex: 1050
                });

                if ($menu.hasClass('dropdown-menu-start')) {
                    $menu.css({
                        left: `${rect.left}px`,
                    })
                }



            });

            function dropdownClose() {
                const $toggle = $('table .dropdown-toggle');
                const $menu = $toggle.next();
                $toggle.removeClass('show');
                $menu.removeClass('show');
            }

            $(window).on('scroll resize', dropdownClose);
            $(document).on('wheel touchmove', dropdownClose);
        }

    };

    themeConfig.headerSticky();
    themeConfig.backgroundImage();
    themeConfig.togglePassword();
    themeConfig.scrollToTop();
    themeConfig.activeSelect2();
    themeConfig.activeTooltip();
    themeConfig.tableResponsive();
    themeConfig.tableDropdown()
    /*
    * Activate preloader
    * Preloader will show if page dose not have any error.
    */
    $(window).on("load", () => $(".custom-preloader").fadeOut());
})(jQuery);