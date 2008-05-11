// $Id$

//add hook:load. process mkdir form 
imce.hooks.load.push(function () {
  var form = $(imce.el('imce-mkdir-form'));
  //clean up fieldsets
  form.find('fieldset').each(function() {
    this.removeChild(this.firstChild);
    $(this).after(this.childNodes);
  }).remove();
  //set ajax
  form.ajaxForm({
    dataType:  'json',
    beforeSubmit: imce.mkdirValidate,
    success: imce.mkdirSuccess,
    complete: function () {imce.fopLoading('mkdir', false);},
    resetForm: true
  });
  //add op
  imce.opAdd({name: 'mkdir', title: Drupal.t('New directory'), content: form.removeClass('imce-hide')});
  if (!imce.conf.perm.mkdir) imce.opDisable('mkdir');
});

//validate mkdir form
imce.mkdirValidate = function (data, form, options) {
  var dirname = data[0].value, dir = imce.conf.dir, branch = imce.tree[dir];
  if (imce.conf.mkdirnum && branch.ul && branch.ul.childNodes.length >= imce.conf.mkdirnum) {
    return imce.setMessage(Drupal.t('You are not alllowed to create more than %num directories.', {'%num': imce.conf.mkdirnum}), 'error');
  }
  if (dirname.search(/^[A-Za-z0-9_\-]+$/) == -1) {
    return imce.setMessage(Drupal.t('Directory name may contain only alphanumeric characters, hyphen and underscore.'), 'error');
  }
  var newdir = (dir == '.' ? '' : dir +'/') + escape(dirname);
  if (imce.tree[newdir]) {
    return imce.setMessage(Drupal.t('Directory %dir already exists.', {'%dir': newdir}), 'error');
  }
  options.url = imce.ajaxURL('mkdir');
  imce.fopLoading('mkdir', true);
  return true;
};

//successful mkdir
imce.mkdirSuccess = function (response) {
  if (response.data) imce.dirSubdirs(imce.conf.dir, response.data);
  if (response.messages) imce.resMsgs(response.messages);
};