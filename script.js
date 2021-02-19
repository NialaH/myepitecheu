let addedElements = [];
let hiddenYear = null;

const removeUselessButton = (length) => {
  var detailsButton = document.getElementsByClassName(
    "mdl-button__ripple-container"
  );
  if (detailsButton.length > length + 1) {
    for (let i = 0; i < detailsButton.length - 1 - length; i++) {
      detailsButton[i + 1].parentNode.remove();
    }
  }
};

const patchYear = (year) => {
  if (hiddenYear) hiddenYear.hidden = false;
  hiddenYear = findElemByText("li", year, XPathResult.FIRST_ORDERED_NODE_TYPE)
    ?.singleNodeValue;
  hiddenYear?.hidden = true;
};

const findElemByText = (tag, text, xpathType) => {
  const node = document.evaluate(
    `//${tag}[text()="${text}"]`,
    document,
    null,
    xpathType,
    null
  );
  return node;
};

const insertCircle = (proj) => {
  const percentage = getPercentage(proj.results);

  const projectNode = findElemByText(
    "span",
    proj.project.name,
    XPathResult.FIRST_ORDERED_NODE_TYPE
  )?.singleNodeValue;
  const circle = document.createElement("div");
  circle.classList.add(
    "progress--circle",
    "center-circle",
    `progress--${Math.round(percentage / 5) * 5}`
  );

  const percent = document.createElement("div");
  percent.classList.add("progress__number");
  percent.innerHTML = percentage;

  circle.appendChild(percent);

  insertAfter(circle, projectNode?.parentNode?.parentNode);
};

const getYear = (url) => {
  return url.split("#")[1].slice(0, 4);
};

const insertAfter = (newNode, referenceNode) => {
  if (referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    addedElements.push(newNode);
  }
};

const getPercentage = (results) => {
  let total = 0;
  let passed = 0;
  for (const [key, value] of Object.entries(results.skills)) {
    total += value.count;
    passed += value.passed;
  }

  return Math.round(Number.parseFloat((passed / total) * 100)) !=
    (passed / total) * 100
    ? Number.parseFloat((passed / total) * 100).toFixed(1)
    : (passed / total) * 100;
};

const fetchData = async (year) => {
  const res = await fetch(`https://api.epitest.eu/me/${year}`, {
    headers: {
      authorization: `Bearer ${localStorage.getItem("argos-elm-openidtoken")}`,
    },
    method: "GET",
  });
  const data = await res.json();
  return data;
};

const patchMyEpitech = async () => {
  if (window.innerWidth > 1000) {
    const currentYear = getYear(window.location.href);
    //patchYear(currentYear);
    const projects = await fetchData(currentYear);
    removeUselessButton(projects.length);

    // const coverage = findElemByText('div', 'Coverage', XPathResult.ANY_TYPE);
    // var node,
    //     nodes = [];
    // while ((node = coverage.iterateNext())) nodes.push(node);
    // console.log(nodes);

    projects.map((proj) => {
      try {
        insertCircle(proj);
        // if (
        //     proj.results.externalItems.find((elem) => elem.type === 'coverage.branches')?.value === 0 &&
        //     proj.results.externalItems.find((elem) => elem.type === 'coverage.lines')?.value === 0
        // )
      } catch (e) {
        console.log(e);
      }
    });
  } else alert("L'extension est uniquement disponible sur PC");
};

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.message === "refresh") {
    addedElements.map((elem) => elem.remove());
    addedElements = [];
    await patchMyEpitech();
  }
});

patchMyEpitech();
