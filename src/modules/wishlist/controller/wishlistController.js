const Wishlist = require("../model/wishlistModel");

exports.addToWishlist = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const userId = req.token._id;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    const exists = wishlist.items.find(
      item =>
        item.product.toString() === productId &&
        (variantId ? item.variant?.toString() === variantId : !item.variant)
    );

    if (exists) {
      return res.send({
        statusCode: 400,
        success: false,
        message: "Item already in wishlist",
        result: {}
      });
    }

    wishlist.items.push({
      product: productId,
      variant: variantId || null
    });

    await wishlist.save();

    res.send({
      statusCode: 200,
      success: true,
      message: "Item added to wishlist",
      result: wishlist
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    const userId = req.token._id;

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          items: {
            product: productId,
            ...(variantId ? { variant: variantId } : { variant: null })
          }
        }
      },
      { new: true }
    );

    res.send({
      statusCode: 200,
      success: true,
      message: "Item removed from wishlist",
      result: wishlist
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const userId = req.token._id;
    const { search = "", page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // 1️⃣ Get wishlist document for the user
    const wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "name images price originalPrice",
        match: search
          ? { name: { $regex: search, $options: "i" } }
          : {} // only apply search if provided
      })
      .populate({
        path: "items.variant",
        select: "color size price originalPrice"
      })
      .lean();

    if (!wishlist) {
      return res.send({
        statusCode: 200,
        success: true,
        message: "Wishlist fetched successfully",
        result: { items: [], total: 0, page: parseInt(page), limit: parseInt(limit) }
      });
    }

    // 2️⃣ Filter out null products (when search doesn't match)
    let filteredItems = wishlist.items.filter(item => item.product);

    // 3️⃣ Apply pagination
    const totalItems = filteredItems.length;
    filteredItems = filteredItems.slice(skip, skip + parseInt(limit));

    res.send({
      statusCode: 200,
      success: true,
      message: "Wishlist fetched successfully",
      result: {
        data: filteredItems,
        totalRecords: totalItems,
        currentPage: parseInt(page),
        totalPages : Math.ceil(parseInt(totalItems)/ parseInt(limit))
      }
    });
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      success: false,
      message: error.message,
      result: {}
    });
  }
};