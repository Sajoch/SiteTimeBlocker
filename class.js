function blocked_site(limit, used, day){
  this.last_check = 0;
  this.first_check = 0;
  this.limit = limit;
  this.used = used;
  this.day=day;
  return this;
}
