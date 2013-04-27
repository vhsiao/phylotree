
function taxon(db_row) {
  this.tsn        = db_row.tsn,
  this.kingdom_id = db_row.kingdom_id,
  this.lft        = db_row.lft,
  this.rgt        = db_row.rgt,
  this.parent_tsn = db_row.parent_tsn,
  this.depth      = db_row.depth,
  this.year       = db_row.year,
  this.name       = db_row.name,
  this.print_self = function() {
    return this.name;
    },
  this.node = function() {
    return {'name':this.name, 'group':this.depth, 'year':this.year, 'tsn':this.tsn}
  },
  this.link = function() {
    return {'source':this.parent_tsn, 'target':this.tsn, 'value':1}
  }
}

module.exports = taxon;
