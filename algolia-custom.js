const isFAQ = window.location.pathname.includes("/faq");
const isSearching = window.location.pathname.includes("/searching");
const isHelpCenter = window.location.pathname.includes("/help-center");
const colorClass = isFAQ ? "is-dark" : "is-light";

const getHeading = (data) => {
  const { hit } = data;
  let h1 = "";
  let h2 = "";
  let h3 = "";
  // console.log("render-hits-", hit);
  h1 = instantsearch.highlight({
    attribute: "h1",
    hit: hit,
    highlightedTagName: "strong",
  });
  if (hit.tag === "h1") {
    h1 = instantsearch.highlight({
      attribute: "name",
      hit: hit,
      highlightedTagName: "strong",
    });
  }
  if (hit.tag === "h2") {
    h2 = instantsearch.highlight({
      attribute: "name",
      hit: hit,
      highlightedTagName: "strong",
    });
  }
  if (hit.tag === "h3") {
    h2 = instantsearch.highlight({
      attribute: "h2",
      hit: hit,
      highlightedTagName: "strong",
    });
    h3 = instantsearch.highlight({
      attribute: "name",
      hit: hit,
      highlightedTagName: "strong",
    });
  }
  let heading = h1;
  const seperator = `<span style="color:grey;">></span>`;
  if (h2) {
    heading += ` ${seperator} ` + h2;
  }
  if (h3) {
    heading += ` ${seperator} ` + h3;
  }
  return heading;
};

const getSearchList = (data) => {
  if (!data) return "";
  const { groupedByCategorie } = data;
  return `
  ${
    groupedByCategorie.length > 0
      ? `
  ${groupedByCategorie
    .map(
      (item) => `
        <div class="st-group">
          <div class="st-group-title ${colorClass}">
          <div class="subtitle-s">${item.categorie}</div>
        </div>
      ${item.hits
        .map((hit) => {
          const HEADING = getHeading({ hit });
          const SEARCH_LINK = `${window.location.origin}/${hit.objectID}`;
          return `
            <a href="${SEARCH_LINK}" class="st-link ${colorClass} w-inline-block">
              <div class="st-name">${HEADING}</div>
              <div class="st-text one-line">
                ${instantsearch.highlight({
                  attribute: "text",
                  hit: hit,
                  highlightedTagName: "strong",
                })}
              </div>
            </a>
          `;
        })
        .join("")}
      </div>`
    )
    .join("")}`
      : `<div class="st-group">
          <div class="st-not-found ${colorClass}">
            <div class="st-name-title">No results found</div>
            <div class="st-text">Make sure all word are spelled correctly.</div>
          </div>
        </div>`
  }`;
};

if (!isFAQ) {
  if (isSearching) {
    $("form.search").remove();
    let searchTips = document.querySelector(".searching-content");
    let noResInner = document.querySelector(".sc-no-results").innerHTML;
    document.querySelector(".sc-no-results").remove();
    let noResults = document.createElement("div");
    noResults.classList = "sc-no-results";
    noResults.innerHTML = noResInner;
    // console.log(noResults);
    let query, arrLength;
    const searchClient = algoliasearch(
      "3IX4R6F9TD",
      "4490249ded50f765cb1b2668f1a26519"
    );
    // const index = instantsearch.widgets.index({
    //   indexName: "test_GLOBAL_SEARCH",
    //   attributesToSnippet: ["text:100"],
    // });
    const search = instantsearch({
      indexName: "test_GLOBAL_SEARCH",
      searchClient,
      routing: true,
      // searchParameters: { attributesToSnippet: ["text:100;"] },
      searchFunction(helper) {
        query = helper.state.query;
        // console.log("search-query-", query);
        if (helper.state.query === "") {
          const urlParam = window.location.search;
          if (urlParam) {
            const searchParams = new URLSearchParams(urlParam);
            if (searchParams.has("query")) {
              const searchQuery = searchParams.get("query");
              if (searchQuery) {
                query = helper.state.query = searchQuery.trim();
              }
            }
          }
          helper.state.hitsPerPage = 5;
          const facetFilters = [["tag:h1"], ["categorie:-Dictionary"]];
          helper.state.facetFilters = facetFilters;
        } else {
          helper.state.hitsPerPage = 20;
          helper.state.facetFilters = [];
        }
        helper.search();
      },
    });
    // Group results by distinct attribute (year) function
    function distinctResults(results, attributeForDistinct) {
      let d = {};
      for (const e of results)
        d[e[attributeForDistinct]] = [...(d[e[attributeForDistinct]] || []), e];
      return Object.entries(d).map(([k, v]) => ({ hits: v, categorie: k }));
    }
    // Create the render function
    const renderHits = (renderOptions, isFirstRender) => {
      const { hits, widgetParams } = renderOptions;
      // If no results
      if (renderOptions.results == undefined) {
        return;
      }
      const groupedByCategorie = distinctResults(hits, "categorie");
      widgetParams.container.innerHTML = `
        <div class="sc-title-box">
          <h2 class="alt-h3 is-black">${hits.length} results for “${query}”</h2>
        </div>
      ${
        groupedByCategorie.length > 0
          ? `
        ${groupedByCategorie
          .map(
            (item) => `
          <div class="sc-group">
            <h3 class="text-body-1 is-black-50-text">${item.categorie}</h3>
            <div class="sc-list">
              ${item.hits
                .map((hit) => {
                  // console.log("hit-", hit);
                  const SEARCH_LINK = `${window.location.origin}/${hit.objectID}`;
                  const HEADING = getHeading({ hit });
                  // let link = hit.slug;
                  return `
                    <a href="${SEARCH_LINK}" class="sc-card w-inline-block">
                      <h4 class="alt-h4 is-black no-margins">${HEADING}</h4>
                      <div class="text-body-2 one-line">
                        ${instantsearch.snippet({
                          attribute: "text",
                          hit: hit,
                          highlightedTagName: "strong",
                        })}
                      </div>
                      <div class="sc-read-more">
                        <div class="svg in-help-link w-embed">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><g clip-path="url(#clip0)"><path d="M16 8C16 3.6 12.4 0 8 0 3.6 0 0 3.6 0 8 0 12.4 3.6 16 8 16 12.4 16 16 12.4 16 8ZM3.9 8C3.9 7.6 4.1 7.3 4.5 7.3L8.4 7.3 10.1 7.4 9.2 6.6 8.2 5.7C8.1 5.6 8 5.4 8 5.2 8 4.9 8.3 4.6 8.7 4.6 8.8 4.6 9 4.7 9.1 4.8L11.8 7.5C12 7.6 12.1 7.8 12.1 8 12.1 8.2 12 8.3 11.8 8.5L9.1 11.2C9 11.3 8.8 11.4 8.7 11.4 8.3 11.4 8 11.1 8 10.8 8 10.6 8.1 10.4 8.2 10.3L9.2 9.4 10.1 8.6 8.4 8.7 4.5 8.7C4.1 8.7 3.9 8.4 3.9 8Z" fill="currentColor"></path></g><defs><clipPath><rect width="16" height="16" transform="translate(0 16)rotate(-90)" fill="white"></rect></clipPath></defs></svg>
                        </div>
                      <div class="text-body-2">Read More</div>
                      </div>
                    </a>
                  `;
                })
                .join("")}
            </div>
          </div>`
          )
          .join("")}`
          : `${noResults.outerHTML}`
      }`;
    };
    const customHits =
      instantsearch.connectors.connectHitsWithInsights(renderHits);
    search.addWidgets([
      customHits({
        container: searchTips,
        transformItems: function (items) {
          return items.map((item) => ({
            ...item,
          }));
        },
      }),
    ]);
    search.addWidget(
      instantsearch.widgets.searchBox({
        container: ".searching-search-box",
        placeholder: "Search...",
        showReset: false,
        cssClasses: {
          root: "",
          form: ["search", "w-form"],
          input: ["input-search", "w-input", "searchfocus"],
          submit: ["search-button", "w-button"],
        },
      })
    );
    search.start();
    // .ais-SearchBox-reset
    const inputSearch = document.querySelector(".searchfocus");
    if (inputSearch.value) $(".ais-SearchBox-reset").css("display", "block");
    if (inputSearch) {
      inputSearch.addEventListener("keyup", function () {
        if (inputSearch.value === "")
          $(".ais-SearchBox-reset").css("display", "none");
        else $(".ais-SearchBox-reset").css("display", "block");
      });
    }
    $(".ais-SearchBox-reset").on("click", function () {
      setTimeout(() => {
        $(".ais-SearchBox-reset").css("display", "none");
      }, 500);
    });
  } else if (isHelpCenter) {
    const searchTips = document.createElement("div");
    (searchTips.className = "search-tips"), (searchTips.style.display = "none");
    const searchClient = algoliasearch(
        "3IX4R6F9TD",
        "4490249ded50f765cb1b2668f1a26519"
      ),
      search = instantsearch({
        indexName: "test_GLOBAL_SEARCH",
        searchClient: searchClient,
        searchFunction(helper) {
          if (helper.state.query === "") {
            helper.state.hitsPerPage = 5;
            const facetFilters = [["tag:h1"], ["categorie:-Dictionary"]];
            helper.state.facetFilters = facetFilters;
          } else {
            helper.state.facetFilters = [];
            helper.state.hitsPerPage = 20;
          }
          helper.search();
        },
        // searchFunction(e) {
        //   "" === e.state.query
        //     ? (e.state.hitsPerPage = 5)
        //     : (e.state.hitsPerPage = 20),
        //     e.search();
        // },
      });
    function distinctResults(e, t) {
      let s = {};
      for (const r of e) s[r[t]] = [...(s[r[t]] || []), r];
      return Object.entries(s).map(([e, t]) => ({ hits: t, categorie: e }));
    }
    const renderHits = (e, t) => {
        const { hits: s, widgetParams: r } = e;
        if (null == e.results) return;
        const n = distinctResults(s, "categorie");
        r.container.innerHTML = getSearchList({ groupedByCategorie: n });
      },
      customHits = instantsearch.connectors.connectHitsWithInsights(renderHits);
    search.addWidgets([
      customHits({
        container: searchTips,
        transformItems: function (e) {
          return e.map((e) => ({ ...e }));
        },
      }),
    ]),
      search.addWidget(
        instantsearch.widgets.searchBox({
          container: ".help-search-box",
          placeholder: "Search...",
          cssClasses: {
            form: ["search", "w-form"],
            input: ["input-search", "w-input", "searchfocus"],
            submit: ["search-button", "w-button"],
            reset: "search-clear",
          },
          templates: {
            reset: document.querySelector(".search-clear").innerHTML,
          },
        })
      ),
      document.querySelector("div:not(.ais-SearchBox)>form.search").remove(),
      search.start(),
      document.querySelector(".help-search-box").append(searchTips);
    const container = document.querySelector(".search-tips"),
      inputSearch = document.querySelector(".searchfocus"),
      clearSearch = document.querySelector(".search-clear");
    let areTipsOpen = !1;
    $(".search-clear").hide();
    const showReset = () => $(".search-clear").fadeTo(100, 1),
      hideReset = () => $(".search-clear").fadeOut(100, 0),
      blurBackground = () =>
        $(".hub-content-box *, header").not(".search-box, .search-box *").css({
          filter: "blur(15px)",
          "z-index": "-1",
        }),
      unblurBackground = () =>
        $(".hub-content-box *, header")
          .not(".search-box, .search-box *")
          .css({ filter: "", "z-index": "" }),
      showTips = () => $(container).slideDown(100).fadeTo(100, 1),
      hideTips = () => $(container).slideUp(100).fadeTo(100, 0),
      resetChange = () => ("" == inputSearch.value ? hideReset() : showReset()),
      introH2 = $(".intro h2").text();
    $(".search-tips").mousedown(function (e) {
      e.preventDefault();
      $(e.target.closest("a")).trigger("click");
    }),
      inputSearch.addEventListener("focusout", function () {
        areTipsOpen &&
          (unblurBackground(), hideTips(), hideReset(), (areTipsOpen = !1));
      }),
      inputSearch.addEventListener("focus", function () {
        areTipsOpen
          ? (areTipsOpen = !1)
          : (blurBackground(), showTips(), resetChange(), (areTipsOpen = !0));
      }),
      inputSearch.addEventListener("keyup", function () {
        $(".hidehits").removeClass("hidehits"),
          $(".intro h2").text(introH2),
          resetChange();
      }),
      clearSearch.addEventListener("mousedown", function (e) {
        e.preventDefault(),
          areTipsOpen
            ? ((areTipsOpen = !0), inputSearch.parentNode.reset(), hideReset())
            : ($(".hidehits").removeClass("hidehits"),
              $(".intro h2").text(introH2),
              inputSearch.blur());
      }),
      $(".ais-SearchBox-form").submit(function (e) {
        e.preventDefault();
        let t = "";
        $(".search-tips .st-link").each(function (e, s) {
          t = t + s.getAttribute("href") + ", ";
        }),
          $(".intro h2").text(
            $(".search-tips .st-link").length +
              ' results for "' +
              $(inputSearch).val() +
              '"'
          ),
          (t = t.substring(0, t.length - 2)),
          setTimeout(showReset, 200);
      }),
      $(document).on("keypress", "input", function (e) {
        if (e.which == 13) {
          // var inputVal = $(this).val();
          // const keyword = $("#search").val();
          const keyword = $(".input-search").val();
          // if (keyword) window.open(`/searching.html?query=${keyword}`, "_self");
          if (keyword) window.open(`/searching?query=${keyword}`, "_self");
        }
      });
  } else {
    const searchTips = document.querySelector(".search-tips");
    if (searchTips) searchTips.style.display = "none";
    const searchClient = algoliasearch(
      "3IX4R6F9TD",
      "4490249ded50f765cb1b2668f1a26519"
    );
    const search = instantsearch({
      indexName: "test_GLOBAL_SEARCH",
      searchClient,
      // searchParameters: { attributesToSnippet: ["text:50;"] },
      searchFunction(helper) {
        if (helper.state.query === "") {
          helper.state.hitsPerPage = 5;
          const facetFilters = [["tag:h1"], ["categorie:-Dictionary"]];
          helper.state.facetFilters = facetFilters;
        } else {
          helper.state.facetFilters = [];
          helper.state.hitsPerPage = 20;
        }
        helper.search();
      },
    });
    // Group results by distinct attribute (year) function
    function distinctResults(results, attributeForDistinct) {
      let d = {};
      for (const e of results)
        d[e[attributeForDistinct]] = [...(d[e[attributeForDistinct]] || []), e];
      return Object.entries(d).map(([k, v]) => ({ hits: v, categorie: k }));
    }
    // Create the render function
    const renderHits = (renderOptions, isFirstRender) => {
      const { hits, widgetParams } = renderOptions;
      if (renderOptions.results == undefined) {
        return;
      }
      const groupedByCategorie = distinctResults(hits, "categorie");
      widgetParams.container.innerHTML = getSearchList({ groupedByCategorie });
    };
    const customHits =
      instantsearch.connectors.connectHitsWithInsights(renderHits);
    search.addWidgets([
      instantsearch.widgets.configure({
        hitsPerPage: 5,
      }),
    ]);
    search.addWidgets([
      customHits({
        container: searchTips,
        transformItems: function (items) {
          return items.map((item) => ({
            ...item,
          }));
        },
      }),
    ]);
    search.addWidget(
      instantsearch.widgets.searchBox({
        container: ".sn-search",
        placeholder: "Search...",
        showReset: false,
        cssClasses: {
          root: "sn-search-box",
          form: ["sn-search-field", "w-form"],
          input: ["sn-search-input", "w-input", "searchfocus"],
          submit: ["search-button", "w-button"],
        },
      })
    );
    let searchInputIcon = document.querySelectorAll(".sn-search-box .svg")[0];
    let resetIcon = document.querySelectorAll(".sn-search-box .svg")[1];
    resetIcon.classList.add("reset");
    search.start();
    document.querySelector(".ais-SearchBox").prepend(searchInputIcon);
    document.querySelector(".ais-SearchBox").append(resetIcon);
    document.querySelector(".sn-search").append(searchTips);
    const container = document.querySelector(".search-tips");
    const inputSearch = document.querySelector(".searchfocus");
    const clearSearch = document.querySelector(".reset");
    const searchIcon = $(".sn-search-link");
    const searchBox = $(".sn-search-box");
    let areTipsOpen = false;
    const blurBackground = () =>
      $(".basic-container, .footer-box-light")
        .not(".sn-search-box, .sn-search-box *")
        .css({ filter: "blur(15px)", "z-index": "-1" });
    const unblurBackground = () =>
      $(".basic-container, .footer-box-light")
        .not(".sn-search-box, .sn-search-box *")
        .css({ filter: "", "z-index": "" });
    const showTips = () => $(container).slideDown(100).fadeTo(100, 1);
    const hideTips = () => $(container).slideUp(100).fadeTo(100, 0);
    const showBG = () => $(".sn-search-bg").fadeIn(100);
    const hideBG = () => $(".sn-search-bg").fadeOut(200);
    $(".sn-search-link").on("click", function (e) {
      searchBox.css("display", "flex");
      searchIcon.toggle();
      showBG();
      setTimeout(() => $("#search").focus(), 100);
    });
    $(".search-tips").mousedown(function (e) {
      e.preventDefault();
      $(e.target.closest("a")).trigger("click");
    });
    inputSearch.addEventListener("focusout", function () {
      if (areTipsOpen) {
        hideBG();
        unblurBackground();
        hideTips();
        searchIcon.toggle();
        searchBox.css("display", "none");
        areTipsOpen = false;
      }
    });
    inputSearch.addEventListener("focus", function () {
      if (!areTipsOpen) {
        blurBackground();
        showTips();
        areTipsOpen = true;
      } else {
        areTipsOpen = false;
      }
    });
    clearSearch.addEventListener("mousedown", function (e) {
      e.preventDefault();
      e.stopPropagation();
      blurBackground();
      inputSearch.parentNode.reset();
      // inputSearch.blur();
    }),
      $(document).on("keypress", "input", function (e) {
        // console.log("keypress-input-", e.which);
        if (e.which == 13) {
          // var inputVal = $(this).val();
          const keyword = $("#search").val();
          // console.log("keypress-input-keyword-", keyword);
          // if (keyword) window.open(`/searching.html?query=${keyword}`, "_self");
          if (keyword) window.open(`/searching?query=${keyword}`, "_self");
        }
      });
  }
}
