import { getUserNames } from './github-users'

export default class Autocomplete {
  constructor(rootEl, options = {}) {
    this.rootEl = rootEl;
    this.options = {
      numOfResults: 10,
      data: [],
      url: this.url,
      ...options,
    };

    this.init();
  }

  /**
   * Given an array and a query, return a filtered array based on the query.
   */
  getResults(query, data) {
    if (!query) return [];

    // Filter for matching strings
    return data.filter((item) => {
      return item.text.toLowerCase().includes(query.toLowerCase());
    });
  }

  onQueryChange(query) {
    // Get data for the dropdown
    if(this.options.url) {
      getUserNames(this.options.url, query).then(sortedUsers => {
        let results = this.getResults(query, sortedUsers);
        results = results.slice(0, this.options.numOfResults);

        this.updateDropdown(results);
      });
    } else if (this.options.data) {
      let results = this.getResults(query, this.options.data);
      results = results.slice(0, this.options.numOfResults);

      this.updateDropdown(results);
    }
  }

  updateDropdown(results) {
    this.listEl.innerHTML = '';
    this.listEl.appendChild(this.createResultsEl(results));
  }

  createResultsEl(results) {
    const fragment = document.createDocumentFragment();
    results.forEach((result) => {
      const el = document.createElement('li');
      el.classList.add('result');
      el.setAttribute('tabindex', 0);
      el.textContent = result.text;

      el.addEventListener('keydown', e => {
        const { onSelect } = this.options;

        switch (e.code) {
          case 'ArrowUp':
            if (!el.previousSibling) {
              el.parentElement.previousElementSibling.focus();
            } else { el.previousSibling.focus(); }
            break;
          case 'ArrowDown':
            if (el.nextSibling) el.nextSibling.focus();
            break;
          case 'Enter':
            onSelect(result.value)
            break;
          default:
        }
      });

      // Pass the value to the onSelect callback
      el.addEventListener('click', () => {
        const { onSelect } = this.options;
        if (typeof onSelect === 'function') onSelect(result.value);
      });

      fragment.appendChild(el);
    });
    return fragment;
  }

  createQueryInputEl() {
    const inputEl = document.createElement('input');
    inputEl.setAttribute('type', 'search');
    inputEl.setAttribute('name', 'query');
    inputEl.setAttribute('autocomplete', 'off');

    inputEl.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.target.focus({preventScroll: true});
        inputEl.nextElementSibling.firstChild.focus();
      }
    });

    inputEl.addEventListener('input',
      event => this.onQueryChange(event.target.value));

    return inputEl;
  }

  init() {
    // Build query input
    this.inputEl = this.createQueryInputEl();
    this.rootEl.appendChild(this.inputEl)

    // Build results dropdown
    this.listEl = document.createElement('ul');
    this.listEl.classList.add('results');
    this.rootEl.appendChild(this.listEl);
  }
}
