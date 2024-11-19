import * as model from './model.js';
import { MODAL_CLOSE_SECOND } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationViews from './views/paginationViews.js';
import bookMarksView from './views/bookMarksView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import addRecipeView from './views/addRecipeView.js';
import { async } from 'regenerator-runtime';

if (module.hot) {
  module.hot.accept;
}

const recipeContainer = document.querySelector('.recipe');

///////////////////////////////////////

const controlRecipies = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());
    bookMarksView.update(model.state.bookmarks);
    // 1) Loading Recipe
    await model.loadrecipe(id);
    // 2) Rendring Recipe

    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    const query = searchView.getQuery();
    if (!query) return;

    await model.loadSearchResults(query);
    resultsView.render(model.getSearchResultsPage(1));
    paginationViews.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};
controlSearchResults();
const controlPagination = function (goToPage) {
  resultsView.render(model.getSearchResultsPage(goToPage));
  paginationViews.render(model.state.search);
};

const controlServings = function (newServings) {
  model.updateServings(newServings);
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  if (!model.state.recipe.bookmarked) {
    model.addBookMark(model.state.recipe);
  } else {
    model.deleteBookMark(model.state.recipe.id);
  }
  recipeView.update(model.state.recipe);

  bookMarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookMarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {

    addRecipeView.renderSpinner()
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);

   addRecipeView.renderMessage()


   bookMarksView.render(model.state.bookmarks)
   
   window.history.pushState(null,'',`#${model.state.recipe.id}`)

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SECOND * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookMarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipies);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookMark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationViews.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
