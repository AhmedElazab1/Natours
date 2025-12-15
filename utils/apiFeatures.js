const qs = require('qs');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const { page, sort, limit, fields, ...queryObj } = this.queryString;

    let queryStr = JSON.stringify(qs.parse(queryObj));
    queryStr = queryStr.replace(/\b(gte?|lte?)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // sort('price ratingsAverage')
      this.query = this.query.sort(this.queryString.sort);
    } else {
      this.query = this.query.sort('_id');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  Paginate() {
    const pageNum = this.queryString.page * 1 || 1;
    const limitNum = this.queryString.limit * 1 || 100;
    const skip = (pageNum - 1) * limitNum;
    this.query = this.query.skip(skip).limit(limitNum);

    return this;
  }
}

module.exports = APIFeatures;
