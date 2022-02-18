const mongoose = require("mongoose");
const Dishes = require("./models/dishes");
const Leaders = require("./models/leaders");
const Promotions = require("./models/promotions");
const Comments = require("./models/comments");

const Dish = require("./shared/dishes");
const Leader = require("./shared/leaders");
const Promotion = require("./shared/promotions");
const Comment = require("./shared/comments");

exports.addData = async function () {
  //   console.log(await Dishes.count());
  if ((await Dishes.count()) === 0) {
    DishList = Dish.DISHES;
    DishList.forEach((dish) => Dishes.create(dish));
    // Dishes.create()
  }
  if ((await Leaders.count()) === 0) {
    LeaderList = Leader.LEADERS;
    LeaderList.forEach((leader) => Leaders.create(leader));
  }
  if ((await Promotions.count()) === 0) {
    PromotionList = Promotion.PROMOTIONS;
    PromotionList.forEach((promo) => Promotions.create(promo));
  }
};
