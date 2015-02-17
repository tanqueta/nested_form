(function($) {
  function escapeRegExp(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  }

  window.NestedFormEvents = function() {
    this.addFields = $.proxy(this.addFields, this);
    this.removeFields = $.proxy(this.removeFields, this);
  };

  NestedFormEvents.prototype = {
    addFields: function(e) {
      // Setup
      var link      = e.currentTarget;
      var assoc     = $(link).data('association');                // Name of child
      var content   = decodeURIComponent(nestedFormBlueprints[$(link).data('blueprint-id')]); // Fields template

      // Make the context correct by replacing <parents> with the generated ID
      // of each of the parent objects
      var parent = $(link).closest('.fields').closestChild('input, textarea, select').eq(0);
      var parentName = $(link).closest('.fields').closestChild('input, textarea, select').eq(0).attr('name') || '';
      var parentId = $(link).closest('.fields').closestChild('input, textarea, select').eq(0).attr('id') || '';
      var contextName = parentName.replace(new RegExp('(\[[a-z_]+\])+$'), '');
      var contextId = parentId.replace(new RegExp('(_\\d+).*'), '$1');

      if (contextName) {
        // Reemplazo el parentName del blueprint
        content = content.replace(new RegExp(escapeRegExp(contextName.replace(new RegExp('\[[0-9]+\]$'), '')) + '\[[0-9]+?\]', 'g'), contextName);

        // Reemplazo el parentId del blueprint
        content = content.replace(new RegExp(escapeRegExp(contextId.replace(new RegExp('_[0-9]+$'), '')) + '_[0-9]+', 'g'), contextId);
      }
      // Make a unique ID for the new child
      var regexp  = new RegExp('new_' + assoc, 'g');
      var new_id  = this.newId();
      content     = $.trim(content.replace(regexp, new_id));

      var field = this.insertFields(content, assoc, link);
      // bubble up event upto document (through form)
      field
        .trigger({ type: 'nested:fieldAdded', field: field })
        .trigger({ type: 'nested:fieldAdded:' + assoc, field: field });
      return false;
    },
    newId: function() {
      return new Date().getTime();
    },
    insertFields: function(content, assoc, link) {
      var target = $(link).data('target');
      if (target && target.substring(0, 1) == "$") target = eval(target);
      if (target) {
        return $(content).appendTo($(target));
      } else {
        return $(content).appendTo($(link).closest("." + assoc));
      }
    },
    removeFields: function(e) {
      var $link = $(e.currentTarget),
          assoc = $link.data('association'); // Name of child to be removed
      
      var hiddenField = $link.prev('input[type=hidden]');
      hiddenField.val('1');
      
      var field = $link.closest('.fields');
      field.hide();
      
      field
        .trigger({ type: 'nested:fieldRemoved', field: field })
        .trigger({ type: 'nested:fieldRemoved:' + assoc, field: field });
      return false;
    }
  };

  window.nestedFormEvents = new NestedFormEvents();
  $(document)
    .delegate('form a.add_nested_fields',    'click', nestedFormEvents.addFields)
    .delegate('form a.remove_nested_fields', 'click', nestedFormEvents.removeFields);
})(jQuery);

// http://plugins.jquery.com/project/closestChild
/*
 * Copyright 2011, Tobias Lindig
 *
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 */
(function($) {
        $.fn.closestChild = function(selector) {
                // breadth first search for the first matched node
                if (selector && selector != '') {
                        var queue = [];
                        queue.push(this);
                        while(queue.length > 0) {
                                var node = queue.shift();
                                var children = node.children();
                                for(var i = 0; i < children.length; ++i) {
                                        var child = $(children[i]);
                                        if (child.is(selector)) {
                                                return child; //well, we found one
                                        }
                                        queue.push(child);
                                }
                        }
                }
                return $();//nothing found
        };
})(jQuery);
